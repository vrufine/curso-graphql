import * as jwt from 'jsonwebtoken';
import { expect, db, app, handleError, chai } from "../../test-utils";
import { UserInstance } from "../../../src/models/UserModel";
import { JWT_SECRET } from '../../../src/utils/utils';
import { PostInstance } from '../../../src/models/PostModel';
import { CommentInstance } from '../../../src/models/CommentModel';

describe('Comment', () => {

  let userId: number;
  let token: string;
  let postId: number;
  let commentId: number;

  beforeEach(() => {
    return db.Comment.destroy({ where: {} })
      .then(rows => db.Post.destroy({ where: {} }))
      .then(rows => db.User.destroy({ where: {} }))
      .then(rows => db.User.create({
        name: 'Thalita Mello',
        email: 'thalita.mello@atualcs.com.br',
        password: '123456'
      }))
      .then((user: UserInstance) => {
        userId = user.get('id');
        const payload = { sub: userId };
        token = jwt.sign(payload, JWT_SECRET);

        return db.Post.create({
          title: 'First post',
          content: 'First post content',
          author: userId,
          photo: 'url_photo_1'
        })
      })
      .then((post: PostInstance) => {
        postId = post.get('id');
        return db.Comment.bulkCreate([
          {
            comment: 'First comment',
            post: postId,
            user: userId
          }, {
            comment: 'Second comment',
            post: postId,
            user: userId
          }, {
            comment: 'Third comment',
            post: postId,
            user: userId
          }
        ])
      })
      .then((comments: CommentInstance[]) => {
        commentId = comments[0].get('id');
      })
  })

  describe('Queries', () => {
    describe('application/json', () => {
      describe('commentsByPost', () => {
        it('should return a list of Comments', () => {
          const body = {
            query: `
              query getCommentsByPost($postId: Int!, $first: Int, $offset: Int) {
                commentsByPost(postId: $postId, first: $first, offset: $offset) {
                  comment
                  user {
                    id
                  }
                  post {
                    id
                  }
                }
              }
            `,
            variables: {
              postId: postId
            }
          };
          return chai.request(app)
            .post('/graphql')
            .set('content-type', 'application/json')
            .send(JSON.stringify(body))
            .then(res => {
              const commentsList = res.body.data.commentsByPost;
              expect(res.body.data).to.be.an('object');
              expect(commentsList).to.be.an('array');
              expect(commentsList[0]).to.have.keys('comment', 'user', 'post');
              expect(commentsList[0]).to.not.have.keys('id', 'createdAt', 'updatedAt');
              expect(parseInt(commentsList[0].user.id)).to.equal(userId);
              expect(parseInt(commentsList[0].post.id)).to.equal(postId);
            }).catch(handleError);
        })
        it('should paginate a list of Comments', () => {
          const body = {
            query: `
              query getCommentsByPost($postId: Int!, $first: Int, $offset: Int) {
                commentsByPost(postId: $postId, first: $first, offset: $offset) {
                  comment
                  user {
                    id
                  }
                  post {
                    id
                  }
                }
              }
            `,
            variables: {
              postId,
              first: 2,
              offset: 1
            }
          };
          return chai.request(app)
            .post('/graphql')
            .set('content-type', 'application/json')
            .send(JSON.stringify(body))
            .then(res => {
              const commentList = res.body.data.commentsByPost;
              expect(res.body.data).to.be.an('object');
              expect(commentList).to.be.an('array').with.length(2);
              expect(commentList[0]).to.have.keys('comment', 'user', 'post');
              expect(commentList[0]).to.not.have.keys('id', 'createdAt', 'updatedAt');
              expect(commentList[0].comment).to.equal('Second comment')
            }).catch(handleError);
        })
      })
    })
  })

  describe('Mutations', () => {
    describe('application/json', () => {
      describe('createComment', () => {
        it('should create a new Comment', () => {
          const body = {
            query: `
              mutation createNewComment($input: CommentInput!) {
                createComment(input: $input) {
                  id
                  comment
                  post {
                    id
                  }
                }
              }
            `,
            variables: {
              input: {
                comment: 'New comment',
                post: postId
              }
            }
          };
          return chai.request(app)
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('authorization', `Bearer ${token}`)
            .send(JSON.stringify(body))
            .then(res => {
              const createdComment = res.body.data.createComment;
              expect(res.body.data).to.be.an('object');
              expect(createdComment).to.be.an('object');
              expect(createdComment).to.have.keys('id', 'comment', 'post');
              expect(parseInt(createdComment.post.id)).to.be.equal(postId);
            }).catch(handleError);
        })
      });

      describe('updateComment', () => {
        it('should update an existing Comment', () => {
          const body = {
            query: `
              mutation updateExistingComment($id: ID!, $input: CommentInput!) {
                updateComment(id: $id, input: $input) {
                  id
                  comment
                }
              }
            `,
            variables: {
              id: commentId,
              input: {
                comment: 'Edited comment',
                post: postId
              }
            }
          };
          return chai.request(app)
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('authorization', `Bearer ${token}`)
            .send(JSON.stringify(body))
            .then(res => {
              const updatedComment = res.body.data.updateComment;
              expect(res.body.data).to.be.an('object');
              expect(updatedComment).to.be.an('object');
              expect(updatedComment).to.have.keys('id', 'comment');
              expect(parseInt(updatedComment.id)).to.be.equal(commentId);
              expect(updatedComment.comment).to.be.equal('Edited comment');
            }).catch(handleError);
        })
      });

      describe('deleteComment', () => {
        it('should delete an existing Comment', () => {
          const body = {
            query: `
              mutation deleteExistingComment($id: ID!) {
                deleteComment(id: $id)
              }
            `,
            variables: {
              id: commentId
            }
          };
          return chai.request(app)
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('authorization', `Bearer ${token}`)
            .send(JSON.stringify(body))
            .then(res => {
              expect(res.body.data.deleteComment).to.be.true;
            }).catch(handleError);
        })
      });
    })
  })
})
