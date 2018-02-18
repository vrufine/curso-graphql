import * as jwt from 'jsonwebtoken';
import { expect, db, app, handleError, chai } from "../../test-utils";
import { UserInstance } from "../../../src/models/UserModel";
import { JWT_SECRET } from '../../../src/utils/utils';

describe('User', () => {
  let userId: number;
  let token: string;

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
        const payload = { sub: userId };
        token = jwt.sign(payload, JWT_SECRET);
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
            }).catch(handleError);
        });
      })
      describe('user', () => {
        it('should return a single User', () => {
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
            }).catch(handleError);
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
            }).catch(handleError);
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
            }).catch(handleError);
        })
      })
    })
  })

  describe('Mutations', () => {
    describe('application/json', () => {
      describe('createUser', () => {
        it('should create a new User', () => {
          const body = {
            query: `
              mutation createNewUser($input: UserCreateInput!) {
                createUser(input: $input) {
                  id
                  name
                  email
                }
              }
            `,
            variables: {
              input: {
                name: 'Heitor Dobeis',
                email: 'heitor@atualcs.com.br',
                password: '123456'
              }
            }
          };
          return chai.request(app)
            .post('/graphql')
            .set('content-type', 'application/json')
            .send(JSON.stringify(body))
            .then(res => {
              let newUser = res.body.data.createUser;
              expect(res.body.data).to.be.an('object');
              expect(newUser).to.be.an('object');
              expect(newUser).to.have.keys('id', 'name', 'email');
              expect(newUser).to.not.have.keys('photo', 'createdAt', 'updatedAt', 'posts');
              expect(parseInt(newUser.id)).to.be.a('number');
              expect(newUser.name).to.eq('Heitor Dobeis');
              expect(newUser.email).to.eq('heitor@atualcs.com.br');
            }).catch(handleError)
        })
      })
      describe('updateUser', () => {
        it('should update an existing User', () => {
          const body = {
            query: `
              mutation updateExistingUser($input: UserUpdateInput!) {
                updateUser(input: $input) {
                  name
                  email
                  photo
                }
              }
            `,
            variables: {
              input: {
                name: 'Vinícius S. Rufine',
                email: 'vsrufine@gmail.com',
                photo: 'photo_base_64'
              }
            }
          };
          return chai.request(app)
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('authorization', `Bearer ${token}`)
            .send(JSON.stringify(body))
            .then(res => {
              const updatedUser = res.body.data.updateUser;
              expect(updatedUser).to.be.an('object');
              expect(updatedUser).to.have.keys('name', 'email', 'photo');
              expect(updatedUser.name).to.eq('Vinícius S. Rufine');
              expect(updatedUser.email).to.eq('vsrufine@gmail.com');
              expect(updatedUser.photo).to.not.be.null;
              expect(updatedUser.id).to.be.undefined;
            }).catch(handleError);
        })
        it('should block the operation if the token is invalid', () => {
          const body = {
            query: `
              mutation updateExistingUser($input: UserUpdateInput!) {
                updateUser(input: $input) {
                  name
                  email
                  photo
                }
              }
            `,
            variables: {
              input: {
                name: 'Vinícius S. Rufine',
                email: 'vsrufine@gmail.com',
                photo: 'photo_base_64'
              }
            }
          };
          return chai.request(app)
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('authorization', `TOKEN INVALIDO`)
            .send(JSON.stringify(body))
            .then(res => {
              const updatedUser = res.body.data.updateUser;
              expect(updatedUser).to.be.null;
              expect(res.body).to.have.keys('data', 'errors');
              expect(res.body.errors).to.be.an('array');
              expect(res.body.errors[0].message).to.equal('JsonWebTokenError: jwt malformed');
            }).catch(handleError);
        })
      })
      describe('updateUserPassword', () => {
        it('should update an existing User\'s password', () => {
          const body = {
            query: `
              mutation updateExistingUserPassword($input: UserUpdatePasswordInput!) {
                updateUserPassword(input: $input)
              }
            `,
            variables: {
              input: {
                password: '11223344'
              }
            }
          };
          return chai.request(app)
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('authorization', `Bearer ${token}`)
            .send(JSON.stringify(body))
            .then(res => {
              expect(res.body.data.updateUserPassword).to.be.true;
            }).catch(handleError);
        })
      })
      describe('deleteUser', () => {
        it('should delete an existing User', () => {
          const body = {
            query: `
              mutation {
                deleteUser
              }
            `
          };
          return chai.request(app)
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('authorization', `Bearer ${token}`)
            .send(JSON.stringify(body))
            .then(res => {
              expect(res.body.data.deleteUser).to.be.true;
            }).catch(handleError);
        })
        it('should return an error if token is not provided', () => {
          const body = {
            query: `
              mutation {
                deleteUser
              }
            `
          };
          return chai.request(app)
            .post('/graphql')
            .set('content-type', 'application/json')
            .send(JSON.stringify(body))
            .then(res => {
              expect(res.body.errors[0].message).to.be.equal('Unauthorized! Token not provided!');
              expect(res.body.data.deleteUser).to.be.null;
            }).catch(handleError);
        })
      })
    })
  })
})
