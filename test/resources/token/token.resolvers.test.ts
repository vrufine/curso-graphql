import {
  app,
  chai,
  expect,
  db,
  handleError
} from './../../test-utils';

describe('Token', () => {

  let userId: number;
  let token: string;
  let postId: number;
  let commentId: number;

  beforeEach(() => {
    return db.Comment.destroy({ where: {} })
      .then(rows => db.Post.destroy({ where: {} }))
      .then(rows => db.User.destroy({ where: {} }))
      .then(rows => db.User.create({
        name: 'Eduardo Kimura',
        email: 'eduardo.kimura@atualcs.com.br',
        password: '123456'
      })).catch(handleError);
  });

  describe('Mutations', () => {
    describe('application/json', () => {
      describe('createToken', () => {
        it('should return a new valid Token', () => {
          const body = {
            query: `
              mutation createNewToken($email: String!, $password: String!) {
                createToken(email: $email, password: $password) {
                  token
                }
              }
            `,
            variables: {
              email: 'eduardo.kimura@atualcs.com.br',
              password: '123456'
            }
          };
          return chai.request(app)
            .post('/graphql')
            .set('content-type', 'application/json')
            .send(JSON.stringify(body))
            .then(res => {
              expect(res.body.data).to.have.key('createToken');
              expect(res.body.data.createToken).to.have.key('token');
              expect(res.body.data.createToken.token).to.be.a('string');
              expect(res.body.errors).to.be.undefined;
            }).catch(handleError);
        })
        it('should return an error if the password is incorret', () => {
          const body = {
            query: `
              mutation createNewToken($email: String!, $password: String!) {
                createToken(email: $email, password: $password) {
                  token
                }
              }
            `,
            variables: {
              email: 'eduardo.kimura@atualcs.com.br',
              password: 'wrong_password'
            }
          };
          return chai.request(app)
            .post('/graphql')
            .set('content-type', 'application/json')
            .send(JSON.stringify(body))
            .then(res => {
              expect(res.body).to.have.keys('data', 'errors');
              expect(res.body.data).to.have.key('createToken');
              expect(res.body.data.createToken).to.be.null;
              expect(res.body.errors).to.be.an('array').with.length(1);
              expect(res.body.errors[0].message).to.equal('Unauthorized, wrong email or password!');
            }).catch(handleError);
        })
        it('should return an error if the email is incorret', () => {
          const body = {
            query: `
              mutation createNewToken($email: String!, $password: String!) {
                createToken(email: $email, password: $password) {
                  token
                }
              }
            `,
            variables: {
              email: 'eduardo.kimura@atualcs.com',
              password: '123456'
            }
          };
          return chai.request(app)
            .post('/graphql')
            .set('content-type', 'application/json')
            .send(JSON.stringify(body))
            .then(res => {
              expect(res.body).to.have.keys('data', 'errors');
              expect(res.body.data).to.have.key('createToken');
              expect(res.body.data.createToken).to.be.null;
              expect(res.body.errors).to.be.an('array');
              expect(res.body.errors[0].message).to.equal('Unauthorized, wrong email or password!');
            }).catch(handleError);
        })
      })
    })
  })
})
