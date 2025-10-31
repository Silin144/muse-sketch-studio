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
      envVars[key] = values.join('=').replace(/"/g, '').replace(/\r/g, '').trim();
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
        const { prompt, editInstruction, garmentType, gender, detailedFeatures, previousSketchUrl, uploadedImageUrl, uploadedLogoUrl, useUploadedImage, designHistory } = data;

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

        console.log('\n🎨 ===== GENERATION REQUEST =====');
        console.log('Original Design:', prompt);
        if (editInstruction) {
          console.log('🔄 EDIT INSTRUCTION:', editInstruction);
          console.log('   (Will preserve original design and only apply this edit)');
        }
        console.log('Gender:', gender, 'Garment:', garmentType);
        if (previousSketchUrl) {
          console.log('🔄 EDIT MODE: Refining based on previous sketch');
        }
        if (uploadedImageUrl) {
          console.log('📷 Using uploaded base image');
        }
        if (uploadedLogoUrl) {
          console.log('✨✨✨ LOGO DETECTED! Logo will be placed creatively on garment ✨✨✨');
          console.log('Logo data type:', uploadedLogoUrl.startsWith('data:') ? 'Base64 image' : 'URL');
          console.log('Logo data length:', uploadedLogoUrl.length, 'characters');
          console.log('Logo preview:', uploadedLogoUrl.substring(0, 100) + '...');
        } else {
          console.log('⚠️⚠️⚠️ NO LOGO PROVIDED - AI will create text/graphics instead of using your logo ⚠️⚠️⚠️');
          console.log('📌 TIP: Upload your logo image in the "Add Logo/Graphics" section');
        }
        console.log('================================\n');

        try {
          // Create comprehensive detailed description from ALL features
          const features = [];
          if (detailedFeatures) {
            if (detailedFeatures.fabric) features.push(`${detailedFeatures.fabric} fabric`);
            if (detailedFeatures.pattern) features.push(`${detailedFeatures.pattern} pattern`);
            if (detailedFeatures.shoulders) features.push(`${detailedFeatures.shoulders} shoulders`);
            if (detailedFeatures.sleeves) features.push(`${detailedFeatures.sleeves} sleeves`);
            if (detailedFeatures.neckline) features.push(`${detailedFeatures.neckline} neckline`);
            if (detailedFeatures.collar) features.push(`${detailedFeatures.collar} collar`);
            if (detailedFeatures.waist) features.push(`${detailedFeatures.waist} waist`);
            if (detailedFeatures.length) features.push(`${detailedFeatures.length} length`);
            if (detailedFeatures.fit) features.push(`${detailedFeatures.fit} fit`);
            if (detailedFeatures.embellishments && detailedFeatures.embellishments !== 'None') features.push(`with ${detailedFeatures.embellishments}`);
            if (detailedFeatures.closure) features.push(`${detailedFeatures.closure} closure`);
            if (detailedFeatures.pockets && detailedFeatures.pockets !== 'No pockets') features.push(`${detailedFeatures.pockets}`);
            if (detailedFeatures.backDetail && detailedFeatures.backDetail !== 'Plain') features.push(`${detailedFeatures.backDetail} back`);
            if (detailedFeatures.hemStyle) features.push(`${detailedFeatures.hemStyle} hem`);
          }
          const featureDescription = features.length > 0 ? `with ${features.join(', ')}` : '';

          const genderContext = gender ? `designed for ${gender.toLowerCase()}` : '';
          
          // Use google/nano-banana for fashion sketch generation
          let fullPrompt;
          let negativePrompt = "";
          
          // Determine if using uploaded image or AI-generated sketch
          const baseImage = useUploadedImage && uploadedImageUrl ? uploadedImageUrl : previousSketchUrl;
          
          if (baseImage) {
            // REFINEMENT MODE: Keep the original image/sketch, only modify what changed
            let logoInstruction = "";
            // IMPORTANT: Don't send logo instructions in edit mode - the logo is already placed
            // Sending it again confuses the AI and makes it recreate the whole design
            
            // Use editInstruction if provided (explicit edit), otherwise use the prompt text
            const changeToApply = editInstruction || prompt;
            
            // Build conversation context if design history exists
            let conversationContext = "";
            if (designHistory && designHistory.length > 0) {
              conversationContext = `\n📝 CONVERSATION HISTORY (for context only - DO NOT recreate these, the image already has them):\n`;
              designHistory.forEach((entry, index) => {
                conversationContext += `${index + 1}. ${entry}\n`;
              });
              conversationContext += `\nAll of the above are ALREADY in the image. Do NOT redo them.\n`;
            }
            
            fullPrompt = `🚨🚨🚨 ABSOLUTE CRITICAL RULE: THIS IS A MICRO-EDIT, NOT A REDESIGN 🚨🚨🚨

YOU ARE EDITING AN EXISTING IMAGE. YOUR JOB IS TO COPY IT 99.9% AND CHANGE ONLY 0.1%.

📸 REFERENCE IMAGE: This shows the CURRENT design state
✏️ YOUR ONLY TASK: "${changeToApply}"
${conversationContext}
🔒 IRONCLAD EDITING RULES - ZERO EXCEPTIONS:

1. COPY THE REFERENCE IMAGE EXACTLY:
   - Same jacket style, silhouette, shape
   - Same collar design and position  
   - Same zipper placement and style
   - Same pocket positions and shapes
   - Same sleeve style and cuffs
   - Same hem and waistband
   - Same construction lines and seams
   - Same proportions and fit

2. PRESERVE ALL EXISTING LOGOS/GRAPHICS:
   - Keep logos in the SAME positions
   - Keep logos at the SAME size (unless specifically asked to change size)
   - Keep logo styles identical
   - If changing logo size: make it 50% smaller or bigger, not 500% different

3. YOUR EDIT: "${changeToApply}"
   - This is the ONLY thing you can change
   - Change NOTHING else
   - Be LITERAL - if it says "make logo smaller", make it 30-50% smaller, not change its position
   - If it says "keep same", DO NOT TOUCH IT AT ALL

4. WHAT "KEEP THE SAME" MEANS:
   - 100% identical - no variation whatsoever
   - Same position, same size, same angle, same everything
   - Not "similar" - IDENTICAL

🚫 ABSOLUTELY FORBIDDEN - WILL RESULT IN FAILURE:
❌ Making the logo bigger when asked to make it smaller
❌ Moving logos to different positions when not asked
❌ Changing the jacket design or structure
❌ Adding new design elements
❌ Removing existing elements not mentioned
❌ "Improving" or "enhancing" anything
❌ Creating a new interpretation
❌ Making it "look better"

✅ CORRECT APPROACH:
1. Take the reference image
2. Copy it pixel-by-pixel (99.9% exact duplicate)
3. Make ONLY this microscopic change: "${changeToApply}"
4. Output the result

📚 EXAMPLES OF CORRECT MICRO-EDITS:
Example 1: "Make logo smaller"
  CORRECT: Keep jacket identical, reduce logo size by 40%, same position
  WRONG: Redesign jacket, change logo position, make it bigger instead

Example 2: "Add text on chest"
  CORRECT: Copy entire design, add small text only on chest, everything else identical
  WRONG: Redesign the whole garment, change existing logos, move elements around

Example 3: "Change sleeve pattern"  
  CORRECT: Duplicate everything, only modify sleeve pattern, keep logo/design/structure
  WRONG: New jacket design, different fit, moved logos, changed proportions

Think: "I'm using Photoshop's micro-edit tool, not the redesign button. CMD+C, CMD+V the image, then make ONE tiny change."

⚠️ CRITICAL: With image_strength=0.98, you MUST preserve 98% of the reference image exactly. Only 2% can change.

CONTEXT (ignore this, use the VISUAL reference): ${prompt}`;
            negativePrompt = "completely new design, different garment, redesigned, reimagined, alternative version, new interpretation, different style, changed silhouette, modified structure, new outfit, different design, recreated design, similar design, inspired by, large logo, oversized logo, huge branding, massive graphics, enlarged text, bigger logo, logo enlargement";
          } else {
            // INITIAL GENERATION MODE: Create new sketch
            let logoInstruction = "";
            if (uploadedLogoUrl) {
              logoInstruction = ` 

🎨 CRITICAL LOGO INSTRUCTION - READ CAREFULLY:
- The reference image contains the actual brand logo/graphic provided by the user
- You MUST use this EXACT logo image - copy it precisely as shown (colors, shape, design)
- DO NOT create your own version, DO NOT draw text, DO NOT recreate the logo
- DO NOT write brand names as text (no "Gucci", "Nike", "Supreme", etc. as text)
- ONLY use the provided logo image exactly as it appears
- Place it creatively and prominently on the garment: oversized back print, bold chest branding, sleeve graphics, shoulder placement, or asymmetric positioning
- Make it look professionally printed, embroidered, or heat-pressed onto the fabric
- Think Supreme, Off-White, Balenciaga style logo placement - bold, confident, fashion-forward
- Integrate it into the fabric design as if it was manufactured that way`;
            }
            fullPrompt = `FASHION DESIGN SKETCH ONLY - NOT A FINISHED PRODUCT!

Create a hand-drawn fashion design sketch in professional technical illustration style:
- Black and white pencil sketch on white paper
- Clean line drawing with construction lines visible
- Technical fashion croquis style (like what designers draw before making the garment)
- Flat technical drawing showing garment details
- ${garmentType || 'dress'} ${genderContext} ${featureDescription}, ${prompt}${logoInstruction}

CRITICAL: This must be a SKETCH/DRAWING, not a photograph or 3D render or finished product mockup!
Style: Hand-drawn fashion illustration, pencil on paper, designer's original sketch, technical flat, black line art on white background

DO NOT create: photographs, 3D renders, product mockups, photorealistic images, finished garments on models`;
            
            // Strong negative prompt to ensure sketch style, not finished product
            negativePrompt = "photograph, photo, 3D render, photorealistic, finished product, product mockup, model wearing clothes, realistic fabric, actual garment, finished clothing, styled photoshoot";
            
            // Add logo-specific restrictions if logo provided
            if (uploadedLogoUrl) {
              negativePrompt += ", text on clothing, written words, drawn letters, handwritten text, typography, text labels, brand name as text, recreated logo, redrawn logo, logo variations";
            }
          }
          
          // Build image_input array
          const imageInputs = [];
          if (baseImage) {
            imageInputs.push(baseImage);
            // CRITICAL: In edit mode, DO NOT send the logo again!
            // The logo is already in the baseImage, sending it again confuses the AI
            // and makes it think it needs to re-place the logo (causing huge logos)
          } else {
            // Only include logo for NEW designs, not edits
            if (uploadedLogoUrl) {
              imageInputs.push(uploadedLogoUrl);
            }
            if (data.sketchSvg) {
              imageInputs.push(data.sketchSvg);
            }
          }
          
          const input = {
            prompt: fullPrompt,
            image_input: imageInputs.length > 0 ? imageInputs : undefined,
            output_format: "jpg"
          };
          
          // For edit mode, add image strength to preserve original design better
          if (baseImage && negativePrompt) {
            input.negative_prompt = negativePrompt;
            // MAXIMUM image strength for micro-edits - 0.98 means 98% preservation
            input.image_strength = 0.98; // Changed from 0.95 to 0.98 for better preservation
            console.log('🔒 EDIT MODE: Using image_strength 0.98 for MAXIMUM design preservation (micro-edits only)');
          }

          console.log(`\n📸 ===== API CALL INFO =====`);
          console.log(`Mode: ${baseImage ? '🔄 EDIT/REFINE (Micro-Edit)' : '✨ NEW DESIGN'}`);
          console.log(`Images: ${imageInputs.length} total`);
          if (baseImage) {
            console.log(`   📋 Image 1: Base design to preserve (contains existing design with logos already placed)`);
            console.log(`   🚫 NOT sending logo again - already in the design`);
            console.log(`Image Strength: ${input.image_strength} (0.98 = 98% preservation, only micro-changes allowed)`);
          } else {
            if (uploadedLogoUrl) {
              console.log(`   🏷️  Image 1: LOGO to place on garment`);
            }
          }
          console.log(`============================\n`);

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
        const { sketchUrl, colors, prompt, previousColoredUrl } = data;

        if (!sketchUrl) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Sketch URL is required', success: false }));
          return;
        }

        console.log('Adding colors to sketch:', colors);
        if (previousColoredUrl) {
          console.log('Refining based on previous colored version:', previousColoredUrl);
        }

        const colorPrompt = colors && colors.length > 0 ? `ONLY ${colors.join(' and ')}` : "appropriate colors";
        const colorList = colors && colors.length > 0 ? colors.join(', ') : "";
        
        let fullPrompt;
        let negativePrompt = "rainbow colors, multicolor, multiple colors, varied colors, colorful mix, color variety";
        
        if (previousColoredUrl) {
          // REFINEMENT MODE: Keep exact same design, only change colors
          fullPrompt = `THIS IS A COLOR/DETAIL EDIT REQUEST, NOT A NEW DESIGN REQUEST. You must COPY the reference garment image exactly and make ONLY this modification: "${prompt || "change the colors"}". 

⚠️ CRITICAL COLOR RESTRICTION:
- Use ONLY these exact colors: ${colorPrompt}
- DO NOT use any other colors (no yellow, purple, green, orange, pink, blue unless specified)
- DO NOT create rainbow or multicolor patterns
- DO NOT add color variety
- ONLY use: ${colorList}

STRICT RULES FOR ALL GARMENT TYPES (dresses, jackets, pants, skirts, shirts, coats, etc.):
- Keep 100% identical: ALL design elements, silhouette, proportions, seam lines, construction details (necklines, sleeves, hems, waistlines, closures, pockets, collars, patterns, embellishments, etc.)
- Keep the exact same base garment design and structure
- Keep the same pose, angle, and body proportions
- Only modify colors/details as mentioned: "${prompt || "change the colors"}"
- Use ONLY colors: ${colorPrompt}
- If user says "remove X", keep everything else 100% identical and only remove X
- If user says "change X color", keep everything else 100% identical and only change X color
- If user says "add X detail", keep everything else 100% identical and only add X detail
- If user says "make X [adjective]", keep everything else 100% identical and only modify X

The reference image is your EXACT TEMPLATE. Copy it precisely and make the SMALLEST possible change to satisfy the request.

This is image-to-image refinement, not text-to-image generation. Professional fashion illustration style, no text or labels, clean background.`;
          negativePrompt += ", different design, new garment, redesigned, altered silhouette, changed proportions, new style, alternative design, modified structure, different shape, different garment type, new dress, new jacket, new pants, new coat, new outfit, completely different";
        } else {
          // INITIAL COLORING MODE: Add colors to sketch
          fullPrompt = `⚠️ STRICT COLOR RULE: Use ONLY these exact colors: ${colorPrompt}. DO NOT use any other colors. DO NOT create rainbow or multicolor patterns.

Add these specific colors to this professional fashion designer sketch: ${colorList}. Maintain the exact same design and proportions, keep the hand-drawn sketch aesthetic, professional fashion illustration style, no text or labels, clean background, ${prompt || ""}. Preserve the original sketch lines and structure while adding ONLY the specified colors (${colorPrompt}) to the garment.`;
          negativePrompt += ", rainbow, multicolor pattern, color variety, colorful mix";
        }

        const input = {
          prompt: fullPrompt,
          image_input: previousColoredUrl ? [previousColoredUrl] : [sketchUrl],
          output_format: "jpg"
        };
        
        if (negativePrompt) {
          input.negative_prompt = negativePrompt;
        }
        
        // For refinement mode, use high image strength to preserve design
        if (previousColoredUrl) {
          input.image_strength = 0.90; // Very high preservation when editing colors
        }

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

        console.log('Generating model photo from design:', designUrl.substring(0, 80) + '...');
        console.log('⚠️⚠️⚠️  CRITICAL: Model must wear the EXACT design from the reference image ⚠️⚠️⚠️');

        const fullPrompt = `🚨 CRITICAL INSTRUCTION - READ CAREFULLY 🚨

YOUR TASK: Create a photorealistic fashion photograph where a model is wearing THE EXACT GARMENT shown in the reference image.

📋 STEP-BY-STEP PROCESS:
1. LOOK at the reference image - this shows the EXACT outfit design (it may be a sketch or colored design)
2. MEMORIZE every detail: colors, patterns, logos, graphics, text, placement, style
3. CREATE a professional photograph of a ${modelType} in ${pose} pose
4. The model MUST be wearing THIS EXACT GARMENT - copy it pixel-perfect
5. Studio lighting, clean background, high fashion editorial style

🔒 ABSOLUTE REQUIREMENTS - NO EXCEPTIONS:
- SAME EXACT COLORS (if black hoodie in reference → black hoodie in photo)
- SAME EXACT PATTERNS (if GG pattern on sleeves → GG pattern on sleeves in photo)
- SAME EXACT LOGOS (if "GUCCI" text on chest → "GUCCI" text on chest in photo)
- SAME EXACT GRAPHICS (any graphics/designs MUST appear identically)
- SAME GARMENT TYPE (hoodie stays hoodie, dress stays dress, etc.)
- SAME DESIGN ELEMENTS (pockets, zippers, stripes, ALL details preserved)

🚫 ABSOLUTELY FORBIDDEN:
- Changing to a different outfit
- Changing colors (NO blue jacket if reference shows black hoodie!)
- Removing or altering logos/graphics/text
- Creating a "similar" or "inspired by" design
- Adding or removing design elements
- ANY modification to the garment whatsoever

✅ YOU ARE CREATING: A product photo for e-commerce - the model wears the EXACT item shown in reference
❌ YOU ARE NOT: Creating a fashion editorial with a different interpretation

Think: "I'm photographing this EXACT hoodie on a model for an online store - it must look IDENTICAL to the design shown"`;

        const input = {
          prompt: fullPrompt,
          image_input: [designUrl],
          output_format: "jpg",
          image_strength: 0.92, // VERY HIGH strength to force design preservation
          negative_prompt: "different outfit, different garment, changed design, altered colors, modified patterns, blue jacket, blazer, suit, dress clothes, business attire, different clothing, new design, redesigned clothes, similar style, inspired by, alternative version, different interpretation, wrong garment type"
        };

        console.log('📸 Generating model photo with MAXIMUM design preservation (image_strength: 0.92)');
        console.log('🎯 Reference design URL is being sent to AI model...');

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

  if (req.method === 'POST' && req.url === '/api/generate-angles') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const { modelPhotoUrl, garmentType, detailedFeatures } = data;

        if (!modelPhotoUrl) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Model photo URL is required', success: false }));
          return;
        }

        console.log('Generating 6 different angle views...');

        // Create detailed description from features for different angle views
        const features = [];
        if (detailedFeatures) {
          if (detailedFeatures.fabric) features.push(`${detailedFeatures.fabric} fabric`);
          if (detailedFeatures.pattern) features.push(`${detailedFeatures.pattern} pattern`);
          if (detailedFeatures.shoulders) features.push(`${detailedFeatures.shoulders} shoulders`);
          if (detailedFeatures.sleeves) features.push(`${detailedFeatures.sleeves} sleeves`);
          if (detailedFeatures.neckline) features.push(`${detailedFeatures.neckline} neckline`);
          if (detailedFeatures.waist) features.push(`${detailedFeatures.waist} waist`);
          if (detailedFeatures.length) features.push(`${detailedFeatures.length} length`);
          if (detailedFeatures.fit) features.push(`${detailedFeatures.fit} fit`);
        }
        const featureDescription = features.length > 0 ? `with ${features.join(', ')}` : '';

        // Define 6 different angles
        const angles = [
          { name: 'front', prompt: 'Direct front view, facing camera, full body shot' },
          { name: 'back', prompt: 'Back view, showing back details, full body shot' },
          { name: 'left_side', prompt: 'Left side profile view, full body shot' },
          { name: 'right_side', prompt: 'Right side profile view, full body shot' },
          { name: 'three_quarter_front', prompt: 'Three-quarter front view, 45 degree angle, full body shot' },
          { name: 'three_quarter_back', prompt: 'Three-quarter back view, 45 degree angle, full body shot' }
        ];

        console.log('Generating 6 angle views in parallel...');

        // Generate all 6 angles in parallel
        const anglePromises = angles.map(async (angle) => {
          const fullPrompt = `⚠️ CRITICAL: Model wearing THE EXACT SAME OUTFIT from the reference image.

${angle.prompt}

RULES:
- Same outfit, same colors, same patterns, same logos, same design - IDENTICAL to reference
- Only change the camera angle/pose as specified: ${angle.prompt}
- Clean white studio background, professional fashion photography
- High-quality catalog style, detailed fabric textures
- Professional lighting, no text or labels

Think: "Same outfit, different angle for a 360° product view"`;
          
          const input = {
            prompt: fullPrompt,
            image_input: [modelPhotoUrl],
            output_format: "jpg",
            image_strength: 0.88, // Very high to preserve outfit
            negative_prompt: "different outfit, changed design, altered colors, modified garment, new clothes"
          };

          try {
            const output = await callReplicateAPI('google/nano-banana', input);
            const imageUrl = Array.isArray(output) ? output[0] : output;
            console.log(`Generated ${angle.name} view successfully`);
            return { angle: angle.name, imageUrl };
          } catch (error) {
            console.error(`Error generating ${angle.name} view:`, error);
            return { angle: angle.name, imageUrl: null, error: error.message };
          }
        });

        const allViews = await Promise.all(anglePromises);
        
        // Filter out any failed generations
        const successfulViews = allViews.filter(v => v.imageUrl);
        
        if (successfulViews.length === 0) {
          throw new Error('Failed to generate any angle views');
        }

        console.log(`Successfully generated ${successfulViews.length} out of 6 angle views`);

        // Use the first successful view as the main image
        const imageUrl = successfulViews[0].imageUrl;

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          imageUrl: imageUrl,
          allViews: successfulViews, // Return all views with their angles
          success: true,
          step: 'angles',
          model: 'nano-banana',
          viewCount: successfulViews.length
        }));

      } catch (error) {
        console.error('Error generating different angle views:', error);
        console.error('Error stack:', error.stack);
        console.error('Input data was:', JSON.stringify(data, null, 2));
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: `Different angle view generation failed: ${error.message}`,
          success: false,
          details: error.stack
        }));
      }
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/generate-ramp-walk') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const { modelPhotoUrl, walkStyle = "confident ramp walk" } = data;

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

        console.log('Generating ramp walk video with Kling-v2.1...');

        const fullPrompt = `Single professional fashion model walking confidently down a runway ramp, ${walkStyle}, one model only, model starts at the back of the runway and walks forward towards camera, smooth fluid motion, elegant confident stride, cameras flashing from audience, professional runway lighting, fashion week atmosphere, full body shot throughout the walk, high fashion presentation, cinematic quality, luxury fashion show environment, seamless single take video, solo model performance`;

        const input = {
          mode: "pro",
          prompt: fullPrompt,
          duration: 10,
          start_image: modelPhotoUrl,
          negative_prompt: "static image, multiple views, composite video, cuts, transitions, blurry, low quality, multiple models, duplicate models, clones, two models, several models, group of models, other people on runway"
        };

        console.log('Using Kling-v2.1 for ramp walk video generation');
        const output = await callReplicateAPI('kwaivgi/kling-v2.1', input, true); // true for video
        
        // Kling-v2.1 returns video URL directly or in output array
        const videoUrl = Array.isArray(output) ? output[0] : output;
        
        if (!videoUrl) {
          throw new Error('No video URL returned from Kling-v2.1 API');
        }

        console.log('Ramp walk video generated successfully:', videoUrl);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          videoUrl: videoUrl,
          success: true,
          step: 'ramp-walk'
        }));

      } catch (error) {
        console.error('Error generating ramp walk video:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: `Ramp walk video generation failed: ${error.message}`,
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
