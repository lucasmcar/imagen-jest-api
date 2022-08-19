const app = require('../src/app');
const supertest = require('supertest');
const request = supertest(app);

test('A aplicação deve rodar na porta 3131', () => {
    return request.get('/').then(res =>{
        var status = res.statusCode = 200;
        expect(status).toEqual(200)
    }).catch(err =>{
        fail(err);
    });
});

