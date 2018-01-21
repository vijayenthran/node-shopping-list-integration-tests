const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Recepies', function() {

    before(function() {
        return runServer();
    });

    after(function() {
        return closeServer();
    });

    it('should list items on GET', function() {
        return chai.request(app)
            .get('/recipes')
            .then(function(res) {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.a('array');

                // because we create three items on app load
                expect(res.body.length).to.be.at.least(1);
                // each item should be an object with key/value pairs
                // for `id`, `name` and `checked`.
                const expectedKeys = ['name', 'ingredients'];
                res.body.forEach(function(item) {
                    expect(item).to.be.a('object');
                    expect(item).to.include.keys(expectedKeys);
                });
            });
    });


    it('should add an item on POST', function() {
        const newItem = {name: 'coffee', ingredients: ['milk', 'sugar']};
        return chai.request(app)
            .post('/recipes')
            .send(newItem)
            .then(function(res) {
                expect(res).to.have.status(201);
                expect(res).to.be.json;
                expect(res.body).to.be.a('object');
                expect(res.body).to.include.keys('name', 'ingredients');
                expect(res.body.id).to.not.equal(null);
                // response should be deep equal to `newItem` from above if we assign
                // `id` to it from `res.body.id`
                expect(res.body).to.deep.equal(Object.assign(newItem, {id: res.body.id}));
            });
    });


    it('should update items on PUT', function() {

        let updateData = {
            name: 'coffee',
            ingredients: ['milk', 'sugar', 'honey']
        };

        return chai.request(app)
            .get('/recipes')
            .then(function(res) {
                for(let i=0 ; i<res.body.length; i++){
                    if(res.body[i].name === updateData.name){
                        updateData.id = res.body[i].id;
                    }
                }
               return updateData;
            }).then(function(updateData){
                return chai.request(app)
                    .put(`/recipes/${updateData.id}`)
                    .send(updateData);
            })
            .then(function(res) {
                expect(res).to.have.status(204);
                expect(res.body).to.be.a('object');
            });
    });

    it('should delete items on DELETE', function() {
        return chai.request(app)
            .get('/recipes')
            .then(function(res) {
                return chai.request(app)
                    .delete(`/recipes/${res.body[0].id}`);
            })
            .then(function(res) {
                expect(res).to.have.status(204);
            });
    });
});
