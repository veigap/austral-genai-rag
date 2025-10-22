import 'dotenv/config';
import { Client } from '@elastic/elasticsearch';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = new Client({
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
});

// Load shared product data
const productsPath = join(__dirname, '../../data/products.json');
const products = JSON.parse(readFileSync(productsPath, 'utf-8'));

async function setupSampleData() {
    try {
        console.log('🔌 Connecting to Elasticsearch...');
        const info = await client.info();
        console.log(`✅ Connected to Elasticsearch ${info.version?.number}\n`);

        // Create products index with sample data
        console.log('📦 Creating products index...');
        console.log(`📄 Loading products from: data/products.json`);

        for (const product of products) {
            await client.index({
                index: 'products',
                id: product.id,
                document: product
            });
        }
        
        await client.indices.refresh({ index: 'products' });
        console.log(`✅ Indexed ${products.length} products\n`);

        // Create customers index with sample data
        console.log('👥 Creating customers index...');
        
        const customers = [
            {
                id: '1',
                name: 'John Doe',
                email: 'john.doe@example.com',
                city: 'San Francisco',
                state: 'California',
                country: 'USA'
            },
            {
                id: '2',
                name: 'Jane Smith',
                email: 'jane.smith@example.com',
                city: 'Los Angeles',
                state: 'California',
                country: 'USA'
            },
            {
                id: '3',
                name: 'Bob Johnson',
                email: 'bob.johnson@example.com',
                city: 'New York',
                state: 'New York',
                country: 'USA'
            },
            {
                id: '4',
                name: 'Alice Williams',
                email: 'alice.williams@example.com',
                city: 'San Diego',
                state: 'California',
                country: 'USA'
            }
        ];

        for (const customer of customers) {
            await client.index({
                index: 'customers',
                id: customer.id,
                document: customer
            });
        }
        
        await client.indices.refresh({ index: 'customers' });
        console.log(`✅ Indexed ${customers.length} customers\n`);

        // List all indices
        console.log('📋 Available indices:');
        const indices = await client.cat.indices({ format: 'json' });
        indices.forEach((index: any) => {
            console.log(`  - ${index.index} (${index['docs.count']} documents)`);
        });

        console.log('\n✅ Sample data setup complete!');
        
    } catch (error) {
        console.error('❌ Error setting up data:', error);
        process.exit(1);
    }
}

setupSampleData();

