/**
 * Example: Complete Objects API Integration
 *
 * This example demonstrates how all the object types work together
 * in a realistic development workflow.
 *
 * Run with:
 * npx tsx examples/objects-integration-example.ts
 */

import { Runloop, Blueprint, Devbox, Snapshot, StorageObject } from '@runloop/api-client';

async function fullIntegrationWorkflow() {
  const client = new Runloop({
    bearerToken: process.env.RUNLOOP_API_KEY,
  });

  console.log('=== Complete Objects API Integration Workflow ===\n');

  // Step 1: Create a blueprint for a Python data science environment
  console.log('Step 1: Creating Python data science blueprint...');
  const blueprint = await Blueprint.create(client, {
    name: 'python-datascience-env',
    system_setup_commands: [
      'apt-get update',
      'apt-get install -y python3-pip python3-venv git',
      'pip3 install pandas numpy matplotlib seaborn jupyter scikit-learn',
    ],
    metadata: {
      purpose: 'data-science',
      language: 'python',
      version: '1.0',
    },
  });
  console.log(`✓ Blueprint created: ${blueprint.name} (${blueprint.id})`);

  // Step 2: Store configuration data in StorageObject
  console.log('\nStep 2: Storing project configuration...');
  const configObj = await StorageObject.create(client, {
    name: 'project-config.json',
    content_type: 'text',
    metadata: {
      type: 'configuration',
      project: 'data-analysis',
    },
  });

  const projectConfig = {
    project_name: 'Sales Data Analysis',
    data_sources: ['sales.csv', 'customers.csv'],
    output_format: 'html',
    analysis_params: {
      time_period: '2023-Q4',
      metrics: ['revenue', 'conversion_rate', 'customer_satisfaction'],
    },
    created_at: new Date().toISOString(),
  };

  await configObj.uploadContent(JSON.stringify(projectConfig, null, 2));
  await configObj.complete();
  console.log(`✓ Configuration stored: ${configObj.name}`);

  // Step 3: Create devbox from blueprint
  console.log('\nStep 3: Creating devbox from blueprint...');
  const devbox = await Devbox.create(client, {
    blueprint_id: blueprint.id,
    name: 'data-science-workspace',
    metadata: {
      project: 'sales-analysis',
      environment: 'development',
    },
  });
  console.log(`✓ Devbox created: ${devbox.id}`);

  let snapshot: Snapshot | null = null;
  let resultsObj: StorageObject | null = null;

  try {
    // Step 4: Download configuration and set up project
    console.log('\nStep 4: Setting up project in devbox...');

    // Download config from storage
    const configDownloadUrl = await configObj.getDownloadUrl();
    await devbox.exec(`curl -o project-config.json "${configDownloadUrl.download_url}"`);

    // Create project structure
    await devbox.exec('mkdir -p ~/data-analysis/{data,notebooks,results}');
    await devbox.exec('mv project-config.json ~/data-analysis/');

    // Create sample data
    const sampleData = `date,product,revenue,customers
2023-10-01,Product A,1000,50
2023-10-02,Product A,1200,60
2023-10-01,Product B,800,40
2023-10-02,Product B,900,45`;

    await devbox.file.write('data-analysis/data/sales.csv', sampleData);

    // Create analysis script
    const analysisScript = `
import pandas as pd
import json
import matplotlib.pyplot as plt
import seaborn as sns

# Load configuration
with open('project-config.json', 'r') as f:
    config = json.load(f)

print(f"Running analysis: {config['project_name']}")

# Load data
df = pd.read_csv('data/sales.csv')
df['date'] = pd.to_datetime(df['date'])

# Basic analysis
total_revenue = df['revenue'].sum()
total_customers = df['customers'].sum()
avg_revenue_per_customer = total_revenue / total_customers

results = {
    'project': config['project_name'],
    'analysis_date': pd.Timestamp.now().isoformat(),
    'metrics': {
        'total_revenue': float(total_revenue),
        'total_customers': int(total_customers),
        'avg_revenue_per_customer': float(avg_revenue_per_customer)
    },
    'data_summary': {
        'records': len(df),
        'date_range': {
            'start': df['date'].min().isoformat(),
            'end': df['date'].max().isoformat()
        }
    }
}

# Save results
with open('results/analysis_results.json', 'w') as f:
    json.dump(results, f, indent=2)

print("Analysis complete!")
print(f"Total Revenue: $" + f"{total_revenue:,.2f}")
print(f"Total Customers: {total_customers}")
print(f"Avg Revenue per Customer: $" + f"{avg_revenue_per_customer:.2f}")
`;

    await devbox.file.write('data-analysis/analyze.py', analysisScript);
    console.log('✓ Project structure and files created');

    // Step 5: Run the analysis
    console.log('\nStep 5: Running data analysis...');
    const analysisResult = await devbox.exec('cd ~/data-analysis && python3 analyze.py');
    console.log(`✓ Analysis completed:\n${analysisResult.stdout}`);

    // Step 6: Create snapshot of the working environment
    console.log('\nStep 6: Creating snapshot of configured environment...');
    const snapshotView = await devbox.snapshotDisk('data-science-workspace-snapshot', {
      blueprint_id: blueprint.id,
      project: 'sales-analysis',
      status: 'analysis-complete',
      timestamp: new Date().toISOString(),
    });
    snapshot = new Snapshot(client, snapshotView);
    console.log(`✓ Snapshot created: ${snapshot.id}`);

    // Step 7: Store analysis results
    console.log('\nStep 7: Storing analysis results...');
    const resultsContent = await devbox.file.read('data-analysis/results/analysis_results.json');

    resultsObj = await StorageObject.create(client, {
      name: `analysis-results-${Date.now()}.json`,
      content_type: 'text',
      metadata: {
        project: 'sales-analysis',
        devbox_id: devbox.id,
        snapshot_id: snapshot.id,
        analysis_type: 'revenue_analysis',
      },
    });

    await resultsObj.uploadContent(resultsContent);
    await resultsObj.complete();
    console.log(`✓ Results stored: ${resultsObj.name}`);

    // Step 8: Demonstrate restoration workflow
    console.log('\nStep 8: Creating new devbox from snapshot...');
    const restoredDevbox = await Devbox.create(client, {
      snapshot_id: snapshot.id,
      name: 'restored-data-science-workspace',
    });
    console.log(`✓ Restored devbox created: ${restoredDevbox.id}`);

    // Verify the environment is restored
    const verifyResult = await restoredDevbox.exec('cd ~/data-analysis && ls -la');
    console.log(`✓ Verified restored environment:\n${verifyResult.stdout}`);

    // Run analysis again to verify everything works
    const rerunResult = await restoredDevbox.exec('cd ~/data-analysis && python3 analyze.py');
    console.log(`✓ Re-ran analysis in restored environment:\n${rerunResult.stdout}`);

    // Step 9: Demonstrate data retrieval and sharing
    console.log('\nStep 9: Generating shareable results...');
    const shareableUrl = await resultsObj.getDownloadUrl(7200); // 2 hours
    console.log(`✓ Shareable results URL generated (valid for 2 hours):`);
    console.log(`  ${shareableUrl.download_url.substring(0, 80)}...`);

    // Parse and display results
    const finalResults = JSON.parse(await resultsObj.downloadAsText());
    console.log('\n✓ Final Analysis Results:');
    console.log(`  Project: ${finalResults.project}`);
    console.log(`  Total Revenue: $${finalResults.metrics.total_revenue.toLocaleString()}`);
    console.log(`  Total Customers: ${finalResults.metrics.total_customers.toLocaleString()}`);
    console.log(`  Avg Revenue/Customer: $${finalResults.metrics.avg_revenue_per_customer.toFixed(2)}`);
    console.log(`  Data Records: ${finalResults.data_summary.records}`);

    // Clean up restored devbox
    await restoredDevbox.shutdown();
    console.log('✓ Restored devbox shutdown');
  } finally {
    // Clean up all resources
    console.log('\nCleaning up resources...');

    await devbox.shutdown();
    console.log('✓ Main devbox shutdown');

    if (snapshot) {
      await snapshot.delete();
      console.log('✓ Snapshot deleted');
    }

    await configObj.delete();
    console.log('✓ Configuration object deleted');

    if (resultsObj) {
      await resultsObj.delete();
      console.log('✓ Results object deleted');
    }

    await blueprint.delete();
    console.log('✓ Blueprint deleted');
  }

  console.log('\n✓ Complete integration workflow finished successfully!');
}

async function multiEnvironmentExample() {
  const client = new Runloop({
    bearerToken: process.env.RUNLOOP_API_KEY,
  });

  console.log('\n=== Multi-Environment Development Workflow ===\n');

  // Create blueprints for different environments
  console.log('Creating environment blueprints...');

  const devBlueprint = await Blueprint.create(client, {
    name: 'nodejs-dev-env',
    system_setup_commands: [
      'curl -fsSL https://deb.nodesource.com/setup_18.x | bash -',
      'apt-get install -y nodejs',
      'npm install -g nodemon jest',
    ],
    metadata: { environment: 'development' },
  });

  const prodBlueprint = await Blueprint.create(client, {
    name: 'nodejs-prod-env',
    system_setup_commands: [
      'curl -fsSL https://deb.nodesource.com/setup_18.x | bash -',
      'apt-get install -y nodejs nginx',
      'npm install -g pm2',
    ],
    metadata: { environment: 'production' },
  });

  console.log(`✓ Dev blueprint: ${devBlueprint.id}`);
  console.log(`✓ Prod blueprint: ${prodBlueprint.id}`);

  // Store shared configuration
  const sharedConfig = await StorageObject.create(client, {
    name: 'app-config.json',
    content_type: 'text',
    metadata: { type: 'shared-config' },
  });

  await sharedConfig.uploadContent(
    JSON.stringify(
      {
        app_name: 'MyApp',
        version: '1.0.0',
        database: { host: 'localhost', port: 5432 },
        features: { auth: true, analytics: true },
      },
      null,
      2,
    ),
  );
  await sharedConfig.complete();

  // Create development environment
  console.log('\nSetting up development environment...');
  const devEnv = await Devbox.create(client, {
    blueprint_id: devBlueprint.id,
    name: 'dev-environment',
  });

  // Create production environment
  console.log('Setting up production environment...');
  const prodEnv = await Devbox.create(client, {
    blueprint_id: prodBlueprint.id,
    name: 'prod-environment',
  });

  try {
    // Deploy to both environments
    const configUrl = await sharedConfig.getDownloadUrl();

    await Promise.all([
      devEnv.exec(`curl -o config.json "${configUrl.download_url}"`),
      prodEnv.exec(`curl -o config.json "${configUrl.download_url}"`),
    ]);

    // Verify both environments
    const [devCheck, prodCheck] = await Promise.all([
      devEnv.exec('node --version && cat config.json | head -3'),
      prodEnv.exec('node --version && pm2 --version && cat config.json | head -3'),
    ]);

    console.log(`✓ Dev environment ready:\n${devCheck.stdout}`);
    console.log(`✓ Prod environment ready:\n${prodCheck.stdout}`);
  } finally {
    // Clean up
    await Promise.all([
      devEnv.shutdown(),
      prodEnv.shutdown(),
      devBlueprint.delete(),
      prodBlueprint.delete(),
      sharedConfig.delete(),
    ]);
    console.log('✓ All environments cleaned up');
  }
}

// Run examples
if (require.main === module) {
  (async () => {
    try {
      await fullIntegrationWorkflow();
      await multiEnvironmentExample();
      console.log('\n🎉 All integration examples completed successfully!');
      process.exit(0);
    } catch (error: any) {
      console.error('\n✗ Error:', error.message);
      if (error.status) {
        console.error(`  Status: ${error.status}`);
      }
      if (error.error) {
        console.error(`  Details: ${JSON.stringify(error.error, null, 2)}`);
      }
      process.exit(1);
    }
  })();
}

export { fullIntegrationWorkflow, multiEnvironmentExample };
