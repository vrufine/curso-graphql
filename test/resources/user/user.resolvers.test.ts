import { expect, db, app, handleError, chai } from "../../test-utils";
import { UserInstance } from "../../../src/models/UserModel";

describe('User', () => {
  let userId: number;
  beforeEach(() => {
    return db.Comment.destroy({ where: {} })
      .then(rows => db.Post.destroy({ where: {} }))
      .then(rows => db.User.destroy({ where: {} }))
      .then(rows => db.User.bulkCreate([
        {
          name: 'Vinícius Rufine',
          email: 'vinicius.rufine@atualcs.com.br',
          password: '123456'
        },
        {
          name: 'João Marcus',
          email: 'joao.marcus@atualcs.com.br',
          password: '123456'
        },
        {
          name: 'Luiz Einz',
          email: 'luiz@atualcs.com.br',
          password: '123456'
        }
      ]))
      .then((users: UserInstance[]) => {
        userId = users[0].get('id');
      })
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
              expect(usersList).to.be.an('array');
              expect(usersList[0]).to.not.have.keys('id', 'photo', 'createdAt', 'updatedAt', 'posts');
              expect(usersList[0]).to.have.keys('name', 'email');
            }).catch(handleError);
        })
        it('should paginate a list of Users', () => {
          const body = {
            query: `
              query getPaginatedList($pageSize: Int, $offset: Int) {
                users (first: $pageSize, offset: $offset) {
                  name
                  email
                  createdAt
                }
              }
            `,
            variables: {
              pageSize: 2,
              offset: 1
            }
          }
          return chai.request(app)
            .post('/graphql')
            .set('content-type', 'application/json')
            .send(JSON.stringify(body))
            .then(res => {
              const paginatedList = res.body.data.users;
              expect(res.body).to.be.an('object');
              expect(paginatedList).to.be.an('array').of.length(2);
              expect(paginatedList[0]).to.have.keys('name', 'email', 'createdAt');
              expect(paginatedList[0]).to.not.have.keys('id', 'updatedAt', 'posts', 'photo');
            })
        });
      })
      describe('user', () => {
        it('should return one User', () => {
          const body = {
            query: `
              query getUserById($id: ID!) {
                user(id: $id) {
                  id
                  name
                  email
                }
              }
            `,
            variables: {
              id: userId
            }
          };
          return chai.request(app)
            .post('/graphql')
            .set('content-type', 'application/json')
            .send(body)
            .then(res => {
              const user = res.body.data.user;
              expect(res.body.data).to.be.an('object');
              expect(user).to.be.an('object');
              expect(user).to.have.keys('id', 'name', 'email');
              expect(user).to.not.have.keys('photo', 'createdAt', 'updatedAt', 'posts');
              expect(user.name).to.eq('Vinícius Rufine');
              expect(user.email).to.eq('vinicius.rufine@atualcs.com.br');
            })
        })
        it('should return only the "name" attribute', () => {
          const body = {
            query: `
              query getUserById($id: ID!) {
                user(id: $id) {
                  name
                }
              }
            `,
            variables: {
              id: userId
            }
          };
          return chai.request(app)
            .post('/graphql')
            .set('content-type', 'application/json')
            .send(body)
            .then(res => {
              const user = res.body.data.user;
              expect(res.body.data).to.be.an('object');
              expect(user).to.be.an('object');
              expect(user).to.have.key('name');
              expect(user).to.not.have.keys('id', 'photo', 'createdAt', 'updatedAt', 'posts', 'email');
              expect(user.name).to.eq('Vinícius Rufine');
              expect(user.email).to.be.undefined;
            })
        })
        it('should return an error if User dont\'t exist', () => {
          const body = {
            query: `
              query getUserById($id: ID!) {
                user(id: $id) {
                  name
                }
              }
            `,
            variables: {
              id: -1
            }
          };
          return chai.request(app)
            .post('/graphql')
            .set('content-type', 'application/json')
            .send(body)
            .then(res => {
              expect(res.body.data.user).to.be.null;
              expect(res.body.errors).to.be.an('array');
              expect(res.body).to.have.keys('data', 'errors');
              expect(res.body.errors[0].message).to.eq('Error: User with id -1 not found!');
            })
        })
      })
    })
  })
})
