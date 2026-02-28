const {MongoClient} = require("mongodb");
const uri =
"mongodb+srv://60305864:55482521m@cluster0.bw3r7xd.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri);


async function getDb(){
    await client.connect();
    return client.db("infs3201_winter2026");
}

module.exports={getDb};