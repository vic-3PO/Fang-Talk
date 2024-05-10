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
        await db.delete(schema.units)
        await db.delete(schema.lessons)
        await db.delete(schema.challenges)
        await db.delete(schema.challengeOptions)
        await db.delete(schema.challengeProgress)

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
        ]);

        await db.insert(schema.units).values([
            {
                id:1,
                courseId:4,
                title:"Unidade 1",
                description: "Aprenda o básico de Coreano",
                order: 1,
            }
        ]);

        await db.insert(schema.lessons).values([
            {
                id:1,
                unitId:1,
                order:1,
                title: "substantivos"
            },
            {
                id:2,
                unitId:1,
                order:2,
                title: "verbos"
            },
            {
                id:3,
                unitId:1,
                order:3,
                title: "pronomes"
            }
        ]);

        await db.insert(schema.challenges).values([
            {
                id: 1,
                lessonId: 1,
                type: "SELECT",
                order: 1,
                question:'Qual das opções significa "o homem"?',
            },
        ]);

        await db.insert(schema.challengeOptions).values([
            {
                id: 1,
                challengeId: 1,
                imageSrc: "/man.svg",
                correct: true,
                text: "그 남자",
                audioSrc: "/kr_man.mp3"
            },
            {
                id: 2,
                challengeId: 1,
                imageSrc: "/woman.svg",
                correct: false,
                text: "여자",
                audioSrc: "/kr_woman.mp3"
            },
            {
                id: 3,
                challengeId: 1,
                imageSrc: "/robot.svg",
                correct: false,
                text: "로봇",
                audioSrc: "/kr_robot.mp3"
            }
        ]);

        console.log("BD limpo")
    } catch(error) {
        console.error(error);
        throw new Error("Falha ao conectar ao BD")
    }
}

main();