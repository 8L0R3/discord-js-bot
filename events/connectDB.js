const mysql = require("mysql")
const {sendError} = require('../utils/sendErrorLogs')

const dbConfig = {
    host: "",
    user: "",
    password: "",
    database: "",
    charset: 'utf8mb4',
    port: 3306,
};

const db = mysql.createConnection(dbConfig);

async function connectToMysql() {
    try {
        await db.connect()
console.log(`╔═══Connecter à la base de donné ✅  ══╗ \n╠host: ${dbConfig.host}                   ║\n╠Database: ${dbConfig.database}              ║\n╠Connecter en tant que: ${dbConfig.user} ║\n╚═════════════════════════════════════╝`)
    }catch(error){
        let where = "connectDB"
        await sendError(error, where)

        console.log(`Problème lors de la connection à Mysql: ${error}`)
    }
    
    

}
module.exports ={
    connectToMysql,
    db,
}
