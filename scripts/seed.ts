import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

import * as schema from "../db/schema"

const sql = neon(process.env.DATABASE_URL!);

const db = drizzle(sql, { schema });

const main = async () => {
    try{
        console.log("Conectando ao BD")

        await db.delete(schema.courses);
        await db.delete(schema.userProgress);

        await db.insert(schema.courses).values([
            {
                id:1,
                title: "Inglês",
                imageSrc:"/us.svg"
            },{
                id:2,
                title: "Espanhol",
                imageSrc:"/es.svg"
            },{
                id:3,
                title: "Francês",
                imageSrc:"/fr.svg"
            },{
                id:4,
                title: "Coreano",
                imageSrc:"/kr.svg"
            },{
                id:5,
                title: "Japonês",
                imageSrc:"/jp.svg"
            }
        ])

        console.log("BD limpo")
    } catch(error) {
        console.error(error);
        throw new Error("Falha ao conectar ao BD")
    }
}

main();