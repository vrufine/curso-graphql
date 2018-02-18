import * as jwt from 'jsonwebtoken';
import { expect, db, app, handleError, chai } from "../../test-utils";
import { UserInstance } from "../../../src/models/UserModel";
import { JWT_SECRET } from '../../../src/utils/utils';
import { PostInstance } from '../../../src/models/PostModel';

describe('Post', () => {

  let userId: number;
  let token: string;
  let postId: number;

  beforeEach(() => {
    return db.Comment.destroy({ where: {} })
      .then(rows => db.Post.destroy({ where: {} }))
      .then(rows => db.User.destroy({ where: {} }))
      .then(rows => db.User.create({
        name: 'Tarsis Sarabia',
        email: 'tarsis@atualcs.com.br',
        password: '123456'
      }))
      .then((user: UserInstance) => {
        userId = user.get('id');
        const payload = { sub: userId };
        token = jwt.sign(payload, JWT_SECRET);

        return db.Post.bulkCreate([
          {
            title: 'First post',
            content: 'First post content',
            author: userId,
            photo: 'url_photo_1'
          },
          {
            title: 'Second post',
            content: 'Second post content',
            author: userId,
            photo: 'url_photo_2'
          },
          {
            title: 'Third post',
            content: 'Third post content',
            author: userId,
            photo: 'url_photo_3'
          },
        ])
      })
      .then((posts: PostInstance[]) => {
        postId = posts[0].get('id');
      })
  })

  describe('Queries', () => {
    describe('application/json', () => {
      describe('posts', () => {
        it('should return a list of Posts', () => {
          const body = {
            query: `
              query {
                posts {
                  title
                  content
                  photo
                }
              }
            `
          };
          return chai.request(app)
            .post('/graphql')
            .set('content-type', 'application/json')
            .send(JSON.stringify(body))
            .then(res => {
              const postsList = res.body.data.posts;
              expect(res.body.data).to.be.an('object');
              expect(postsList).to.be.an('array');
              expect(postsList[0]).to.not.have.keys('id', 'comments', 'author', 'createdAt', 'updatedAt');
              expect(postsList[0]).to.have.keys('title', 'content', 'photo');
            }).catch(handleError);
        })
        it('should paginate a list of Posts', () => {
          const body = {
            query: `
              query getPaginatedPosts($first: Int, $offset: Int) {
                posts (first: $first, offset: $offset) {
                  id
                  title
                }
              }
            `,
            variables: {
              first: 2,
              offset: 1
            }
          };
          return chai.request(app)
            .post('/graphql')
            .set('content-type', 'application/json')
            .send(JSON.stringify(body))
            .then(res => {
              const postList = res.body.data.posts;
              expect(res.body.data).to.be.an('object');
              expect(postList).to.be.an('array').length(2);
              expect(postList[0]).to.have.keys('id', 'title');
              expect(postList[0]).to.not.have.keys('content', 'comments', 'photo', 'createdAt', 'updatedAt', 'author');
              expect(postList[0].title).eq('Second post');
            }).catch(handleError);
        })
      })
      describe('post', () => {
        it('should return a single Post with its author', () => {
          const body = {
            query: `
              query getPostById($id: ID!) {
                post (id: $id) {
                  title
                  author {
                    name
                    email
                  }
                  comments {
                    comment
                  }
                }
              }
            `,
            variables: {
              id: postId
            }
          };
          return chai.request(app)
            .post('/graphql')
            .set('content-type', 'application/json')
            .send(JSON.stringify(body))
            .then(res => {
              const singlePost = res.body.data.post;
              expect(res.body.data).to.be.an('object');
              expect(singlePost).to.be.an('object');
              expect(singlePost).to.have.keys('title', 'author', 'comments');
              expect(singlePost).to.not.have.keys('photo', 'createdAt', 'updatedAt');
              expect(singlePost.title).to.be.eq('First post');
              expect(singlePost.author).to.not.be.undefined;
              expect(singlePost.author).to.have.keys('name', 'email');
              expect(singlePost.author.name).to.be.eq('Tarsis Sarabia');
              expect(singlePost.author.email).to.be.eq('tarsis@atualcs.com.br');
            }).catch(handleError);
        })
      })
    })
  })

  describe('Mutations', () => {
    describe('application/json', () => {
      describe('createPost', () => {
        it('should create a new Post', () => {
          const body = {
            query: `
              mutation createNewPost($input: PostInput!) {
                createPost(input: $input) {
                  id
                  title
                  content
                  author {
                    id
                    name
                    email
                  }
                }
              }
            `,
            variables: {
              input: {
                title: 'Fourth post',
                content: 'Fourth post content',
                photo: 'url_photo_4'
              }
            }
          };
          return chai.request(app)
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('authorization', `Bearer ${token}`)
            .send(JSON.stringify(body))
            .then(res => {
              const createdPost = res.body.data.createPost;
              expect(res.body.data).to.be.an('object');
              expect(createdPost).to.be.an('object');
              expect(createdPost).to.have.keys('id', 'title', 'content', 'author');
              expect(createdPost.title).to.eq('Fourth post');
              expect(createdPost.content).to.eq('Fourth post content');
              expect(parseInt(createdPost.author.id)).to.eq(userId);
            }).catch(handleError);
        })
      })
      describe('updatePost', () => {
        it('should update an existing Post', () => {
          const body = {
            query: `
              mutation updateExistingPost($id: ID!, $input: PostInput!) {
                updatePost(id: $id, input: $input) {
                  title
                  content
                  photo
                }
              }
            `,
            variables: {
              id: postId,
              input: {
                title: 'Fourth post v2',
                content: 'Fourth post content edited',
                photo: 'new_url_photo_4'
              }
            }
          };
          return chai.request(app)
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('authorization', `Bearer ${token}`)
            .send(JSON.stringify(body))
            .then(res => {
              const updatedPost = res.body.data.updatePost;
              expect(res.body.data).to.be.an('object');
              expect(updatedPost).to.be.an('object');
              expect(updatedPost).to.have.keys('title', 'content', 'photo');
              expect(updatedPost).to.not.have.keys('id', 'createdAt', 'updatedAt', 'comments', 'author');
              expect(updatedPost.title).to.eq('Fourth post v2');
              expect(updatedPost.content).to.eq('Fourth post content edited');
              expect(updatedPost.photo).to.eq('new_url_photo_4');
            }).catch(handleError);
        })
      })
      describe('deletePost', () => {
        it('should delete an existing Post', () => {
          const body = {
            query: `
              mutation deleteExistingPost($id: ID!) {
                deletePost(id: $id)
              }
            `,
            variables: {
              id: postId
            }
          };
          return chai.request(app)
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('authorization', `Bearer ${token}`)
            .send(JSON.stringify(body))
            .then(res => {
              expect(res.body.data).to.have.key('deletePost');
              expect(res.body.data.deletePost).to.be.true;
            }).catch(handleError);
        })
      })
    })
  })
})
