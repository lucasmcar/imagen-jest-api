const app = require('../src/app');
const supertest = require('supertest');
const request = supertest(app);

let mainUser = {
    name: "Lucas",
    email: "lucas@teste.com",
    password: "123456"
}

//Executa antes de qualquer teste
beforeAll(() => {
    //Inserir usuario Lucas no banco
    return request.post('/user')
    .send(mainUser).then((res) =>{

    }). catch(err => {
        console.log(err);
    });

});

afterAll(() =>{
    //Remover usuario Lucas do banco
    return request.delete('/delete/' + mainUser.email).then(res=>{

    }).catch(err =>{
        console.log(err);
    })
})


describe("Cadastro de usuario",() =>{
    test("Deve cadastrar um usuario com sucesso", () =>{

        let time = Date.now();
        let email = `${time}@teste.com`
        let user = {name: "Lucas", email: email, password: "123453436"};

        return request.post('/user')
            .send(user).then((res) =>{
                
                expect(res.statusCode).toEqual(200);
                expect(res.body.email).toEqual(email);

            }). catch(err => {
                fail(err);
            });
    });

    test("Deve impedir que o usuario se cadastre com os dados vazios", () =>{
        
        let user = {name: "", email: "", password: ""};

        return request.post('/user')
            .send(user).then((res) =>{
                
                expect(res.statusCode).toEqual(400);

            }). catch(err => {
                fail(err);
            });
    });

    test("Deve impedir que usuário se cadastre com email repetido" ,() =>{
        let time = Date.now();
        let email = `${time}@teste.com`
        let user = {name: "Lucas", email: email, password: "123453436"};

        return request.post('/user')
            .send(user).then((res) =>{
                
                expect(res.statusCode).toEqual(200);
                expect(res.body.email).toEqual(email);

                return request.post("/user")
                .send(user)
                .then((res) => {
                    expect(res.statusCode).toEqual(400);
                    expect(res.body.error).toEqual("Email já cadastrado")

                }).catch(err =>{
                    fail(err)
                });

            }). catch(err => {
                fail(err);
            });
    })

});


describe("Autenticação", () =>{
    test("Deve me retornar o token quando logar", ()=>{
        return request.post('/auth')
        .send({email: mainUser.email, password: mainUser.password})
        .then(res=>{
            expect(res.statusCode).toEqual(200)
            expect(res.body.token).toBeDefined()
        }).catch(err =>{
            fail(err);
        })
    });

    test("Deve impedir que um usuario não cadastrado se logue", () =>{
        return request.post('/auth')
        .send({email: "nãoexistente@email.com", password: "145252525252"})
        .then(res=>{
            expect(res.statusCode).toEqual(403)
            expect(res.body.token.errors.email).toEqual("Email não cadastrado")
        }).catch(err =>{
            fail(err);
        });
    });


    test("Deve impedir que um usuario se logue com uma senha errada", () =>{
        return request.post('/auth')
        .send({email: mainUser.email, password: "145252525252"})
        .then(res=>{
            expect(res.statusCode).toEqual(403)
            expect(res.body.token.errors.passoword).toEqual("Senha incorreta")
        }).catch(err =>{
            fail(err);
        });
    })
});

