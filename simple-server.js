// Simple server with real Replicate API calls
import http from 'http';
import https from 'https';
import { readFileSync } from 'fs';

const PORT = 3001;

// Read environment variables
let envVars = {};
try {
  const envContent = readFileSync('.env', 'utf8');
  envContent.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...values] = line.split('=');
      envVars[key] = values.join('=').replace(/"/g, '');
    }
  });
} catch (error) {
  console.log('No .env file found');
}

// Function to make Replicate API calls
async function callReplicateAPI(model, input, isVideo = false) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      input: input
    });

    const options = {
      hostname: 'api.replicate.com',
      port: 443,
      path: `/v1/models/${model}/predictions`,
      method: 'POST',
      headers: {
        'Authorization': `Token ${envVars.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 201) {
            // Poll for completion
            pollPrediction(response.id, resolve, reject, 0, isVideo);
          } else {
            reject(new Error(`API Error: ${res.statusCode} - ${data}`));
          }
        } catch (error) {
          reject(new Error(`Parse Error: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request Error: ${error.message}`));
    });

    req.write(postData);
    req.end();
  });
}

// Function to poll prediction status
function pollPrediction(predictionId, resolve, reject, attempts = 0, isVideo = false) {
  const maxAttempts = isVideo ? 240 : 60; // 20 minutes for video, 5 minutes for images
  
  if (attempts >= maxAttempts) {
    reject(new Error('Prediction timeout'));
    return;
  }

  const options = {
    hostname: 'api.replicate.com',
    port: 443,
    path: `/v1/predictions/${predictionId}`,
    method: 'GET',
    headers: {
      'Authorization': `Token ${envVars.REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        
        if (response.status === 'succeeded') {
          resolve(response.output);
        } else if (response.status === 'failed') {
          reject(new Error(`Prediction failed: ${response.error}`));
        } else if (response.status === 'processing' || response.status === 'starting') {
          // Still processing, poll again after 5 seconds
          setTimeout(() => {
            pollPrediction(predictionId, resolve, reject, attempts + 1, isVideo);
          }, 5000);
        } else {
          reject(new Error(`Unknown status: ${response.status}`));
        }
      } catch (error) {
        reject(new Error(`Parse Error: ${error.message}`));
      }
    });
  });

  req.on('error', (error) => {
    reject(new Error(`Request Error: ${error.message}`));
  });

  req.end();
}

const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      env_check: {
        replicate_token: !!envVars.REPLICATE_API_TOKEN,
        model_id: envVars.MODEL_ID || 'using default',
        prompt_template: !!envVars.PROMPT_TEMPLATE
      }
    }));
    return;
  }

  if (req.method === 'POST' && req.url === '/api/generate-sketch') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const { prompt } = data;

        if (!prompt) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Prompt is required', success: false }));
          return;
        }

        if (!envVars.REPLICATE_API_TOKEN) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            error: 'REPLICATE_API_TOKEN not configured',
            success: false 
          }));
          return;
        }

        console.log('Generating fashion sketch with prompt:', prompt);

        try {
          // Use google/nano-banana for fashion sketch generation
          const input = {
            prompt: `Professional fashion designer sketch, hand-drawn style, clean pencil lines, technical fashion illustration, ${data.garmentType || 'dress'}, ${prompt}. Pure sketch only, no text, no labels, no annotations, no background elements, white/cream paper background, detailed garment construction lines, professional fashion croquis style, elegant proportions, fashion design studio quality`,
            image_input: data.sketchSvg ? [data.sketchSvg] : undefined,
            output_format: "jpg"
          };

          const output = await callReplicateAPI('google/nano-banana', input);
          
          // Extract image URL from output (could be array or direct URL)
          const imageUrl = Array.isArray(output) ? output[0] : output;
          
          if (!imageUrl) {
            throw new Error('No image URL returned from API');
          }

          console.log('Sketch generated successfully:', imageUrl);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            imageUrl: imageUrl,
            success: true,
            step: 'sketch'
          }));

        } catch (error) {
          console.error('Error generating sketch:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            error: `Generation failed: ${error.message}`,
            success: false 
          }));
        }

      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Invalid JSON',
          success: false 
        }));
      }
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/add-colors') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const { sketchUrl, colors, prompt } = data;

        if (!sketchUrl) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Sketch URL is required', success: false }));
          return;
        }

        console.log('Adding colors to sketch:', colors);

        const colorPrompt = colors && colors.length > 0 ? `Using these specific colors: ${colors.join(', ')}, ` : "";
        const fullPrompt = `${colorPrompt}Add colors to this professional fashion designer sketch, maintain the exact same design and proportions, keep the hand-drawn sketch aesthetic, professional fashion illustration style, no text or labels, clean background, ${prompt || ""}. Preserve the original sketch lines and structure while adding the specified colors to the garment.`;

        const input = {
          prompt: fullPrompt,
          image_input: [sketchUrl],
          output_format: "jpg"
        };

        const output = await callReplicateAPI('google/nano-banana', input);
        const imageUrl = Array.isArray(output) ? output[0] : output;

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          imageUrl: imageUrl,
          success: true,
          step: 'colored'
        }));

      } catch (error) {
        console.error('Error adding colors:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: `Color generation failed: ${error.message}`,
          success: false 
        }));
      }
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/generate-model') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const { designUrl, modelType = "diverse fashion model", pose = "standing" } = data;

        if (!designUrl) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Design URL is required', success: false }));
          return;
        }

        console.log('Generating model photo');

        const fullPrompt = `Professional fashion photography, ${modelType}, ${pose} pose, wearing this exact outfit design, studio lighting, high fashion editorial style, detailed fabric textures, clean background, no text or watermarks, fashion magazine quality`;

        const input = {
          prompt: fullPrompt,
          image_input: [designUrl],
          output_format: "jpg"
        };

        const output = await callReplicateAPI('google/nano-banana', input);
        const imageUrl = Array.isArray(output) ? output[0] : output;

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          imageUrl: imageUrl,
          success: true,
          step: 'model'
        }));

      } catch (error) {
        console.error('Error generating model photo:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: `Model generation failed: ${error.message}`,
          success: false 
        }));
      }
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/generate-runway') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const { modelPhotoUrl, walkStyle = "elegant runway walk" } = data;

        if (!modelPhotoUrl) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Model photo URL is required', success: false }));
          return;
        }

        if (!envVars.REPLICATE_API_TOKEN) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            error: 'REPLICATE_API_TOKEN not configured',
            success: false 
          }));
          return;
        }

        console.log('Generating runway video with Veo-3...');

        const fullPrompt = `Professional fashion runway show, ${walkStyle}, model walking confidently down the runway, smooth fluid motion, elegant stride, high fashion presentation, professional lighting, fashion week atmosphere, cinematic quality, no text or watermarks, luxury fashion show environment, seamless loop motion`;

        const input = {
          image: modelPhotoUrl,
          prompt: fullPrompt
        };

        const output = await callReplicateAPI('google/veo-3', input, true); // true for video
        
        // Veo-3 returns video URL directly or in output array
        const videoUrl = Array.isArray(output) ? output[0] : output;
        
        if (!videoUrl) {
          throw new Error('No video URL returned from Veo-3 API');
        }

        console.log('Runway video generated successfully:', videoUrl);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          videoUrl: videoUrl,
          success: true,
          step: 'runway'
        }));

      } catch (error) {
        console.error('Error generating runway video:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: `Runway video generation failed: ${error.message}`,
          success: false 
        }));
      }
    });
    return;
  }

  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`🚀 Simple API server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎨 Generate endpoint: http://localhost:${PORT}/api/generate`);
  
  console.log('\n🔧 Environment Status:');
  console.log(`  REPLICATE_API_TOKEN: ${envVars.REPLICATE_API_TOKEN ? '✅ Set' : '❌ Missing'}`);
  console.log(`  MODEL_ID: ${envVars.MODEL_ID || 'using default'}`);
  console.log(`  PROMPT_TEMPLATE: ${envVars.PROMPT_TEMPLATE || 'using default'}`);
  
  if (!envVars.REPLICATE_API_TOKEN) {
    console.log('\n⚠️  Install dependencies with "npm install" and use server.js for real AI generation');
  }
});
