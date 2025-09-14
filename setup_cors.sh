
#!/bin/bash
# This script configures Firebase Storage CORS settings to allow uploads
# from the Firebase Studio development environment.

# Step 1: Create the CORS configuration file
cat > cors-config.json << EOL
[
  {
    "origin": [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://6000-firebase-studio-1756796276779.cluster-n281f5a51-ol-w.cloudworkstations.dev",
      "https://6000-firebase-studio-1756796276779.cluster-3gc7bglotjgwuxlqpiut7yyqt4.cloudworkstations.dev",
      "https://studio--vendorverse-rhu2g.us-central1.hosted.app",
      "https://vendorverse-rhu2g.web.app"
    ],
    "method": [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "OPTIONS"
    ],
    "responseHeader": [
      "Content-Type",
      "Authorization",
      "x-goog-resumable"
    ],
    "maxAgeSeconds": 3600
  }
]
EOL

# Step 2: Get the Project ID from Firebase
PROJECT_ID="vendorverse-rhu2g"
if [ -z "$PROJECT_ID" ]; then
  echo "Error: Could not determine Firebase Project ID."
  exit 1
fi
echo "Firebase Project ID: $PROJECT_ID"

# Step 3: Apply the CORS configuration to the default storage bucket
# Use the newer firebasestorage.app domain format
BUCKET_NAME="gs://${PROJECT_ID}.firebasestorage.app"
echo "Applying CORS configuration to bucket: $BUCKET_NAME"
gcloud storage buckets update $BUCKET_NAME --cors-file=./cors-config.json

# Step 4: Clean up the configuration file
rm cors-config.json

echo "CORS configuration applied successfully."
