import { cache } from "react";
import db from "@/db/drizzle";
import { auth } from "@clerk/nextjs";

import { asc, eq } from "drizzle-orm";
import { challengeProgress, challenges, courses, lessons, units, userProgress } from "./schema";

// Função para buscar o progresso do usuário logado.
export const getUserProgress = cache(async () => {
  const { userId } = await auth(); // Obtém o ID do usuário autenticado.
  
  if (!userId) { // Verifica se o usuário está autenticado.
    return null; // Retorna nulo se não estiver autenticado.
  }

  // Busca o progresso do usuário no banco de dados.
  const data = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId), // Filtra pelo ID do usuário.
    with: {
      activeCourse: true, // Inclui o curso ativo do usuário.
    },
  });

  return data; // Retorna os dados do progresso do usuário.
});

// Função para buscar as unidades do curso ativo do usuário.
export const getUnits = cache(async () => {
  const { userId } = await auth(); // Obtém o ID do usuário autenticado.

  if (!userId) {
    return null; // Retorna nulo se o usuário não estiver autenticado.
  }

  const userProgress = await getUserProgress(); // Obtém o progresso do usuário.
  
  if (!userProgress?.activeCourseId) { // Verifica se há um curso ativo.
    return []; // Retorna uma lista vazia se não houver curso ativo.
  }

  // Busca as unidades do curso ativo no banco de dados.
  const data = await db.query.units.findMany({
    where: eq(units.courseId, userProgress.activeCourseId), // Filtra pelas unidades do curso ativo.
    with: {
      lessons: { // Inclui as lições associadas às unidades.
        with: {
          challenges: { // Inclui os desafios das lições.
            with: {
              challengeProgress: { // Inclui o progresso dos desafios do usuário.
                where: eq(challengeProgress.userid, userId),
              },
            },
          },
        },
      },
    },
  });

  // Normaliza os dados para incluir a informação de conclusão das lições.
  const normalizeData = data.map((unit) => {
    const lessonsWithCompletedStatus = unit.lessons.map((lesson) => {
      // Verifica se todos os desafios da lição foram concluídos.
      const allCompletedChallenges = lesson.challenges.every((challenge) => {
        return challenge.challengeProgress && 
               challenge.challengeProgress.length > 0 && 
               challenge.challengeProgress.every((progress) => progress.completed);
      });

      return { ...lesson, completed: allCompletedChallenges }; // Adiciona a propriedade "completed" às lições.
    });
    return { ...unit, lessons: lessonsWithCompletedStatus }; // Retorna as unidades com as lições normalizadas.
  });

  return normalizeData; // Retorna as unidades normalizadas.
});

// Função para buscar todos os cursos disponíveis.
export const getCourses = cache(async () => {
  const data = await db.query.courses.findMany(); // Busca todos os cursos no banco de dados.
  return data; // Retorna os cursos encontrados.
});

// Função para buscar um curso específico pelo ID.
export const getCourseById = cache(async (courseId: number) => {
  const data = await db.query.courses.findFirst({
    where: eq(courses.id, courseId), // Filtra pelo ID do curso.
  });
  
  return data; // Retorna o curso encontrado.
});

// Função para obter o progresso no curso ativo do usuário.
export const getCourseProgress = cache(async () => {
  const { userId } = await auth(); // Obtém o ID do usuário autenticado.
  const userProgress = await getUserProgress(); // Obtém o progresso do usuário.

  if (!userId || !userProgress?.activeCourseId) {
    return null; // Retorna nulo se não houver usuário ou curso ativo.
  }

  // Busca as unidades do curso ativo ordenadas.
  const unitsInActivateCourse = await db.query.units.findMany({
    orderBy: (units, { asc }) => [asc(units.order)], // Ordena as unidades pela ordem.
    where: eq(units.courseId, userProgress.activeCourseId), // Filtra pelo curso ativo.
    with: {
      lessons: { // Inclui as lições das unidades.
        orderBy: (lessons, { asc }) => [asc(lessons.order)], // Ordena as lições pela ordem.
        with: {
          unit: true, // Inclui a unidade associada.
          challenges: { // Inclui os desafios das lições.
            with: {
              challengeProgress: { // Inclui o progresso dos desafios do usuário.
                where: eq(challengeProgress.userid, userId),
              },
            },
          },
        },
      },
    },
  });
  
  // Encontra a primeira lição não concluída.
  const firstUncompletedLesson = unitsInActivateCourse
    .flatMap((unit) => unit.lessons) // Junta todas as lições de todas as unidades.
    .find((lesson) => { // Procura pela primeira lição com desafios não concluídos.
      return lesson.challenges.some((challenge) => {
        return !challenge.challengeProgress || 
               challenge.challengeProgress.length === 0 || 
               challenge.challengeProgress.some((progress) => progress.completed === false);
      });
    });

  return {
    activeLesson: firstUncompletedLesson, // Retorna a primeira lição não concluída.
    activeLessonId: firstUncompletedLesson?.id, // Retorna o ID da lição.
  };
});

// Função para buscar uma lição específica.
export const getLesson = cache(async (id?: number) => {
  const { userId } = await auth(); // Obtém o ID do usuário autenticado.

  if (!userId) {
    return null; // Retorna nulo se o usuário não estiver autenticado.
  }

  const CourseProgress = await getCourseProgress(); // Obtém o progresso no curso.

  const lessonId = id || CourseProgress?.activeLessonId; // Usa o ID da lição ativa, se não for passado um ID específico.

  if (!lessonId) {
    return null; // Retorna nulo se não houver lição ativa.
  }

  // Busca a lição no banco de dados.
  const data = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId), // Filtra pelo ID da lição.
    with: {
      challenges: { // Inclui os desafios da lição.
        orderBy: (challenges, { asc }) => [asc(challenges.order)], // Ordena os desafios pela ordem.
        with: {
          challengeOptions: true, // Inclui as opções dos desafios.
          challengeProgress: { // Inclui o progresso dos desafios.
            where: eq(challengeProgress.userid, userId),
          },
        },
      },
    },
  });

  if (!data || !data.challenges) {
    return null; // Retorna nulo se não encontrar a lição ou os desafios.
  }

  // Normaliza os desafios para incluir a informação de conclusão.
  const normalizeChallenges = data.challenges.map((challenge) => {
    const completed = challenge.challengeProgress && 
                      challenge.challengeProgress.length > 0 && 
                      challenge.challengeProgress.every((progress) => progress.completed);

    return { ...challenge, completed }; // Adiciona a propriedade "completed" aos desafios.
  });

  return { ...data, challenges: normalizeChallenges }; // Retorna a lição com os desafios normalizados.
});

// Função para calcular a porcentagem de conclusão da lição ativa.
export const getLessonPercentage = cache(async () => {
  const CourseProgress = await getCourseProgress(); // Obtém o progresso no curso.

  if (!CourseProgress?.activeLessonId) {
    return 0; // Retorna 0% se não houver lição ativa.
  }

  const lesson = await getLesson(CourseProgress.activeLessonId); // Busca a lição ativa.

  if (!lesson) {
    return 0; // Retorna 0% se não encontrar a lição.
  }

  // Calcula a porcentagem de desafios concluídos.
  const completedChallenges = lesson.challenges.filter((challenge) => challenge.completed);
  const percentage = Math.round(
    (completedChallenges.length / lesson.challenges.length) * 100, // Porcentagem baseada nos desafios concluídos.
  );

  return percentage; // Retorna a porcentagem de conclusão.
});
