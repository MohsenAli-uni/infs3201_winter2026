const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://60305864:55482521m@cluster0.bw3r7xd.mongodb.net/infs3201_winter2026?appName=Cluster0";

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });

(async () => {
  try {
    await client.connect();
    console.log("✅ Connected");
  } catch (e) {
    console.log("❌", e.name, e.message);
  } finally {
    await client.close();
  }
})();