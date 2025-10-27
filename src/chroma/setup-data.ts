import 'dotenv/config';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { ChromaClient } from 'chromadb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load shared product data
const productsPath = join(__dirname, '../../data/products.json');
const products = JSON.parse(readFileSync(productsPath, 'utf-8'));

async function setupChromaData() {
    try {
        console.log('🔌 Connecting to ChromaDB...');
        
        const chromaUrl = process.env.CHROMA_URL || 'http://localhost:8000';
        console.log(`   Trying to connect to: ${chromaUrl}`);
        
        // Parse URL to get host and port
        const url = new URL(chromaUrl);
        console.log(`   Host: ${url.hostname}, Port: ${url.port || 8000}`);
        
        // Use ChromaDB client library
        const client = new ChromaClient({
            path: chromaUrl
        });
        
        console.log('✅ Connected to ChromaDB');
        console.log(`📍 ChromaDB URL: ${chromaUrl}`);
        
        // Delete collection if it exists (for clean setup)
        try {
            await client.deleteCollection({ name: 'products' });
            console.log('🗑️  Deleted existing "products" collection');
        } catch (error) {
            // Collection doesn't exist, that's fine
        }
        
        // Create collection using client library
        console.log('📦 Creating "products" collection...');
        console.log(`📄 Loading products from: data/products.json`);
        console.log('🔧 Embedding: Using server-side embedding function');
        
        const collection = await client.createCollection({
            name: 'products',
            metadata: {
                description: 'Product catalog for e-commerce'
            }
        });
        
        console.log('✅ Created collection: products');
        
        // Prepare data for ChromaDB
        const ids = products.map((p: any) => p.id);
        const documents = products.map((p: any) => 
            `${p.name}. ${p.description}. Category: ${p.category}. Price: $${p.price}${p.stock ? `. Stock: ${p.stock}` : ''}`
        );
        const metadatas = products.map((p: any) => ({
            name: p.name,
            category: p.category,
            price: p.price,
            description: p.description,
            ...(p.stock && { stock: p.stock })
        }));
        
        // Add documents to collection using client library
        console.log(`📝 Adding ${products.length} products to collection...`);
        await collection.add({
            ids,
            documents,
            metadatas
        });
        
        console.log('✅ Data initialization complete!');
        console.log('\n📊 Summary:');
        console.log(`   Collection: products`);
        console.log(`   Documents: ${products.length}`);
        console.log('\n🔍 Sample products:');
        products.slice(0, 3).forEach((p: any) => {
            console.log(`   - ${p.name} ($${p.price}) - ${p.category}`);
        });
        
        // Verify by querying using client library
        console.log('\n🧪 Testing query: "laptop"...');
        const results = await collection.query({
            queryTexts: ['laptop'],
            nResults: 2
        });
        
        console.log(`   Found ${results.ids[0].length} results`);
        
        console.log('\n✨ ChromaDB is ready for queries!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error setting up ChromaDB:', error);
        process.exit(1);
    }
}

setupChromaData();

