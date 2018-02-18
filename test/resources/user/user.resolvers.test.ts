import { expect, db, app, handleError, chai } from "../../test-utils";

describe('User', () => {
  beforeEach(() => {
    return db.Comment.destroy({ where: {} })
      .then(rows => db.Post.destroy({ where: {} }))
      .then(rows => db.User.destroy({ where: {} }))
      .then(rows => db.User.create({
        name: 'Vinícius Rufine',
        email: 'vinicius.rufine@atualcs.com.br',
        password: '123456'
      }))
  })

  describe('Queries', () => {
    describe('application/json', () => {
      describe('users', () => {
        it('should return a list of Users', () => {
          const body = {
            query: `
              query {
                users {
                  name
                  email
                }
              }
            `
          };
          return chai.request(app)
            .post('/graphql')
            .set('content-type', 'application/json')
            .send(JSON.stringify(body))
            .then(res => {
              const usersList = res.body.data.users;
              expect(res.body.data).to.be.an('object');
              expect(usersList).to.be.an('array').of.length(1);
              expect(usersList[0]).to.not.have.keys('id', 'photo', 'createdAt', 'updatedAt', 'posts');
              expect(usersList[0]).to.have.keys('name', 'email');
            }).catch(handleError);
        })
      })
    })
  })
})
