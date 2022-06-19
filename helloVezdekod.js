const {quiz} = require("./quiz");

function calculateQuiz(answers, quiz) {
    let result = {};
    for (const [key, value] of Object.entries(answers)) {
        let key_int = Number(key);
        let quiz_item = quiz.questions[key_int - 1];

        result[quiz_item.type] = result[quiz_item.type] ?
            result[quiz_item.type] + quiz_item.a[value - 1] :
            quiz_item.a[value - 1];
    }
    return result;
}

function getPath(result) {
    return Object.entries(result).reduce((a, b) => a[1] > b[1] ? a : b)[0]
}

const quizStartResponse = function (body, append=false) {
    let answers = body.state.session?.answers ? body.state.session.answers : {};
    if (append) {
        console.log("APPEND", body.state.session.quizStep, body.request.command)
        answers[body.state.session.quizStep] = Number(body.request.command);
    }
    if (body.state.session?.quizStep && quiz.questions[body.state.session?.quizStep ?? 0] == null) {
        const path = `${getPath(calculateQuiz(body.state.session.answers, quiz))}`;
        console.log(calculateQuiz(body.state.session.answers, quiz));
        return {
            response: {
                text: `Попробуй: ${path}`,
                tss: `Попробуй: ${path}`,
                end_session: false,
            },
            session: {
                session_id: body.session.session_id,
                user_id: body.session.user_id,
                message_id: body.session.message_id,
            },
            version: body.version,
            session_state: {
            },
        };
    }
    const command = Number(body.request.command);
    if (body.state.session?.quizStep && 0 <= command - 1&& command - 1< quiz.questions[body.state.session?.quizStep - 1].length) {
        return {
            response: {
                text: "Плохой ответ. Повтори",
                tts: "Плохой ответ. Повтори",
                end_session: false,
            },
            session: {
                session_id: body.session.session_id,
                user_id: body.session.user_id,
                message_id: body.session.message_id,
            },
            version: body.version,
            session_state: {
                quizStep: body.state.session?.quizStep,
                answers: answers
            },
        };
    }
    return {
        response: {
            text: quiz.questions[body.state.session?.quizStep ?? 0].q,
            tts: quiz.questions[body.state.session?.quizStep ?? 0].q,
            end_session: false,
        },
        session: {
            session_id: body.session.session_id,
            user_id: body.session.user_id,
            message_id: body.session.message_id,
        },
        version: body.version,
        session_state: {
            quizStep: body.state.session.quizStep ? body.state.session.quizStep + 1 : 1,
            answers: answers
        },
    };
};

const helloVezdekodResponse = function (body) {
    const response = {
        response: {
            text: "Привет, вездекодерам!",
            tts: "Привет, вездек+одерам!",
            end_session: false,
        },
        session: {
            session_id: body.session.session_id,
            user_id: body.session.user_id,
            message_id: body.session.message_id,
        },
        version: body.version,
    };
    return response;
};

const helpVezdekodResponse = function (body) {
    const response = {
        response: {
            text: "Привет, вездекодеры! Скажите: 'Привет, Вездекод, мы Тостер!' Также вы можете сказать 'Хочу пройти тест', и я устрою вам викторину!",
            tts: "Привет, вездек+одеры! Скажите: 'Привет, Вездек+од, мы Тостер!' Также вы можете сказать 'Хочу пройти тест', и я устрою вам викторину!",
            end_session: false,
        },
        session: {
            session_id: body.session.session_id,
            user_id: body.session.user_id,
            message_id: body.session.message_id,
        },
        version: body.version,
    };
    return response;
};

const marusyaHello = (requestBody) => {
    const commandWords = requestBody.request.nlu.tokens;
    const quiz_step = requestBody.state.session?.quizStep;
    console.log("Quiz step: ", quiz_step)
    if (typeof quiz_step === 'number' &&  0 < quiz_step && quiz_step <= quiz.questions.length) {
        return quizStartResponse(requestBody, true);
    }
    if (commandWords.includes("тостер") && commandWords.includes("вездеход"))
        return helloVezdekodResponse(requestBody);

    if (commandWords.includes("тест") &&
        commandWords.includes("хочу") &&
        commandWords.includes("пройти") &&
        commandWords.length === 3)
        return quizStartResponse(requestBody);

    return helpVezdekodResponse(requestBody);
};

module.exports = {marusyaHello};
