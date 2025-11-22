/**
 * WebSocket Integration Tests
 * Tests for real-time subscription functionality
 */

import WebSocket from 'ws';
import http from 'http';
import { Pool } from 'pg';
import { startServer, stopServer } from '../../src/server';
import { initializeDb } from '../../src/db/migrations';
import request from 'supertest';
import { createApp } from '../../src/app';
import {
  cleanupDatabase,
  closePool,
} from '../setup';

describe('WebSocket Endpoints', () => {
  let server: http.Server;
  let serverUrl: string;
  let pool: Pool;

  beforeAll(async () => {
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database:
        process.env.DB_NAME || 'sc_test',
      user: process.env.DB_USER || 'postgres',
      password:
        process.env.DB_PASSWORD || 'postgres',
    });

    await initializeDb(pool);

    server = await startServer(pool, 3001);
    serverUrl = 'ws://localhost:3001';
  });

  afterAll(async () => {
    await stopServer(server);
    await closePool(pool);
  });

  beforeEach(async () => {
    await cleanupDatabase(pool, [
      'context_entries',
      'contexts',
    ]);
  });

  describe('WS /contexts/:contextId/subscribe', () => {
    it('should establish WebSocket connection', (done) => {
      const app = createApp(pool);
      const contextId =
        '00000000-0000-0000-0000-000000000001';

      const ws = new WebSocket(
        `${serverUrl}/contexts/${contextId}/subscribe`
      );

      ws.on('open', () => {
        expect(ws.readyState).toBe(WebSocket.OPEN);
        ws.close();
        done();
      });

      ws.on('error', (error) => {
        done(error);
      });
    });

    it('should receive update messages', (done) => {
      const contextId =
        '00000000-0000-0000-0000-000000000002';

      // First, create context via HTTP
      request('http://localhost:3001')
        .post('/contexts')
        .send({})
        .end((err, res) => {
          if (err) return done(err);

          const createdContextId =
            res.body.contextId;

          // Subscribe to updates
          const ws = new WebSocket(
            `${serverUrl}/contexts/${createdContextId}/subscribe`
          );
          const messages: any[] = [];

          ws.on('message', (data) => {
            messages.push(JSON.parse(data.toString()));
          });

          ws.on('open', () => {
            // Add entry to context
            request('http://localhost:3001')
              .post(
                `/contexts/${createdContextId}/context`
              )
              .send({ content: 'Test entry' })
              .end((err) => {
                if (err) return done(err);

                // Wait for message
                setTimeout(() => {
                  expect(messages.length).toBeGreaterThan(
                    0
                  );
                  ws.close();
                  done();
                }, 100);
              });
          });

          ws.on('error', (error) => {
            done(error);
          });
        });
    });

    it('should include message type in updates', (done) => {
      request('http://localhost:3001')
        .post('/contexts')
        .send({})
        .end((err, res) => {
          if (err) return done(err);

          const createdContextId =
            res.body.contextId;

          const ws = new WebSocket(
            `${serverUrl}/contexts/${createdContextId}/subscribe`
          );
          const messages: any[] = [];

          ws.on('message', (data) => {
            messages.push(JSON.parse(data.toString()));
          });

          ws.on('open', () => {
            request('http://localhost:3001')
              .post(
                `/contexts/${createdContextId}/context`
              )
              .send({ content: 'Test' })
              .end((err) => {
                if (err) return done(err);

                setTimeout(() => {
                  expect(messages[0].type).toBe(
                    'update'
                  );
                  ws.close();
                  done();
                }, 100);
              });
          });

          ws.on('error', (error) => {
            done(error);
          });
        });
    });

    it('should include entry ID and content in updates', (done) => {
      request('http://localhost:3001')
        .post('/contexts')
        .send({})
        .end((err, res) => {
          if (err) return done(err);

          const createdContextId =
            res.body.contextId;

          const ws = new WebSocket(
            `${serverUrl}/contexts/${createdContextId}/subscribe`
          );
          const messages: any[] = [];

          ws.on('message', (data) => {
            messages.push(JSON.parse(data.toString()));
          });

          ws.on('open', () => {
            request('http://localhost:3001')
              .post(
                `/contexts/${createdContextId}/context`
              )
              .send({ content: 'My content' })
              .end((err) => {
                if (err) return done(err);

                setTimeout(() => {
                  expect(messages[0]).toHaveProperty(
                    'id'
                  );
                  expect(messages[0]).toHaveProperty(
                    'content'
                  );
                  expect(messages[0].content).toBe(
                    'My content'
                  );
                  ws.close();
                  done();
                }, 100);
              });
          });

          ws.on('error', (error) => {
            done(error);
          });
        });
    });

    it('should include timestamp in updates', (done) => {
      request('http://localhost:3001')
        .post('/contexts')
        .send({})
        .end((err, res) => {
          if (err) return done(err);

          const createdContextId =
            res.body.contextId;

          const ws = new WebSocket(
            `${serverUrl}/contexts/${createdContextId}/subscribe`
          );
          const messages: any[] = [];

          ws.on('message', (data) => {
            messages.push(JSON.parse(data.toString()));
          });

          ws.on('open', () => {
            request('http://localhost:3001')
              .post(
                `/contexts/${createdContextId}/context`
              )
              .send({ content: 'Test' })
              .end((err) => {
                if (err) return done(err);

                setTimeout(() => {
                  expect(messages[0]).toHaveProperty(
                    'timestamp'
                  );
                  expect(
                    typeof messages[0].timestamp
                  ).toBe('number');
                  ws.close();
                  done();
                }, 100);
              });
          });

          ws.on('error', (error) => {
            done(error);
          });
        });
    });

    it('should support multiple concurrent subscribers', (done) => {
      request('http://localhost:3001')
        .post('/contexts')
        .send({})
        .end((err, res) => {
          if (err) return done(err);

          const createdContextId =
            res.body.contextId;

          const subscribers: WebSocket[] = [];
          const allMessages: any[][] = [[], [], []];

          // Create 3 subscribers
          for (let i = 0; i < 3; i++) {
            const ws = new WebSocket(
              `${serverUrl}/contexts/${createdContextId}/subscribe`
            );

            ws.on('message', (data) => {
              allMessages[i].push(
                JSON.parse(data.toString())
              );
            });

            subscribers.push(ws);
          }

          // Wait for all connections
          let connectedCount = 0;
          subscribers.forEach((ws) => {
            ws.on('open', () => {
              connectedCount++;

              if (connectedCount === 3) {
                // All connected, add entry
                request('http://localhost:3001')
                  .post(
                    `/contexts/${createdContextId}/context`
                  )
                  .send({ content: 'Broadcast test' })
                  .end((err) => {
                    if (err) return done(err);

                    setTimeout(() => {
                      expect(
                        allMessages[0].length
                      ).toBeGreaterThan(0);
                      expect(
                        allMessages[1].length
                      ).toBeGreaterThan(0);
                      expect(
                        allMessages[2].length
                      ).toBeGreaterThan(0);

                      subscribers.forEach((ws) =>
                        ws.close()
                      );
                      done();
                    }, 100);
                  });
              }
            });
          });

          subscribers.forEach((ws) => {
            ws.on('error', (error) => {
              done(error);
            });
          });
        });
    });

    it('should handle graceful disconnection', (done) => {
      request('http://localhost:3001')
        .post('/contexts')
        .send({})
        .end((err, res) => {
          if (err) return done(err);

          const createdContextId =
            res.body.contextId;

          const ws = new WebSocket(
            `${serverUrl}/contexts/${createdContextId}/subscribe`
          );

          ws.on('open', () => {
            ws.close();

            // Wait for close
            setTimeout(() => {
              expect(ws.readyState).toBe(
                WebSocket.CLOSED
              );
              done();
            }, 50);
          });

          ws.on('error', (error) => {
            done(error);
          });
        });
    });

    it('should not send to disconnected subscribers', (done) => {
      request('http://localhost:3001')
        .post('/contexts')
        .send({})
        .end((err, res) => {
          if (err) return done(err);

          const createdContextId =
            res.body.contextId;

          const ws1 = new WebSocket(
            `${serverUrl}/contexts/${createdContextId}/subscribe`
          );
          const ws2 = new WebSocket(
            `${serverUrl}/contexts/${createdContextId}/subscribe`
          );

          let connectedCount = 0;
          const messages: any[] = [];

          ws2.on('message', (data) => {
            messages.push(JSON.parse(data.toString()));
          });

          ws1.on('open', () => {
            connectedCount++;
            if (connectedCount === 2) {
              // Disconnect ws1
              ws1.close();

              setTimeout(() => {
                // Send message
                request('http://localhost:3001')
                  .post(
                    `/contexts/${createdContextId}/context`
                  )
                  .send({ content: 'Test' })
                  .end((err) => {
                    if (err) return done(err);

                    setTimeout(() => {
                      // ws2 should get the message
                      expect(
                        messages.length
                      ).toBeGreaterThan(0);
                      ws2.close();
                      done();
                    }, 100);
                  });
              }, 50);
            }
          });

          ws2.on('open', () => {
            connectedCount++;
          });

          ws1.on('error', (error) => {
            done(error);
          });

          ws2.on('error', (error) => {
            done(error);
          });
        });
    });
  });

  describe('Multiple subscribers', () => {
    it('should broadcast to all active subscribers', (done) => {
      request('http://localhost:3001')
        .post('/contexts')
        .send({})
        .end((err, res) => {
          if (err) return done(err);

          const contextId = res.body.contextId;

          const ws1Messages: any[] = [];
          const ws2Messages: any[] = [];

          const ws1 = new WebSocket(
            `${serverUrl}/contexts/${contextId}/subscribe`
          );
          const ws2 = new WebSocket(
            `${serverUrl}/contexts/${contextId}/subscribe`
          );

          ws1.on('message', (data) => {
            ws1Messages.push(JSON.parse(data.toString()));
          });

          ws2.on('message', (data) => {
            ws2Messages.push(JSON.parse(data.toString()));
          });

          let connectedCount = 0;

          ws1.on('open', () => {
            connectedCount++;
            if (connectedCount === 2) {
              // Both connected
              request('http://localhost:3001')
                .post(`/contexts/${contextId}/context`)
                .send({ content: 'Broadcast' })
                .end((err) => {
                  if (err) return done(err);

                  setTimeout(() => {
                    expect(ws1Messages.length).toBeGreaterThan(
                      0
                    );
                    expect(ws2Messages.length).toBeGreaterThan(
                      0
                    );
                    ws1.close();
                    ws2.close();
                    done();
                  }, 100);
                });
            }
          });

          ws2.on('open', () => {
            connectedCount++;
          });

          ws1.on('error', (error) => {
            done(error);
          });

          ws2.on('error', (error) => {
            done(error);
          });
        });
    });

    it('should isolate updates by context', (done) => {
      request('http://localhost:3001')
        .post('/contexts')
        .send({})
        .end((err, res1) => {
          if (err) return done(err);

          request('http://localhost:3001')
            .post('/contexts')
            .send({})
            .end((err, res2) => {
              if (err) return done(err);

              const context1Id = res1.body.contextId;
              const context2Id = res2.body.contextId;

              const context1Messages: any[] = [];
              const context2Messages: any[] = [];

              const ws1 = new WebSocket(
                `${serverUrl}/contexts/${context1Id}/subscribe`
              );
              const ws2 = new WebSocket(
                `${serverUrl}/contexts/${context2Id}/subscribe`
              );

              ws1.on('message', (data) => {
                context1Messages.push(
                  JSON.parse(data.toString())
                );
              });

              ws2.on('message', (data) => {
                context2Messages.push(
                  JSON.parse(data.toString())
                );
              });

              let connectedCount = 0;

              ws1.on('open', () => {
                connectedCount++;
                if (connectedCount === 2) {
                  // Both connected
                  request('http://localhost:3001')
                    .post(
                      `/contexts/${context1Id}/context`
                    )
                    .send({
                      content: 'Context 1 message',
                    })
                    .end((err) => {
                      if (err) return done(err);

                      setTimeout(() => {
                        expect(
                          context1Messages.length
                        ).toBeGreaterThan(0);
                        expect(
                          context2Messages.length
                        ).toBe(0);
                        ws1.close();
                        ws2.close();
                        done();
                      }, 100);
                    });
                }
              });

              ws2.on('open', () => {
                connectedCount++;
              });

              ws1.on('error', (error) => {
                done(error);
              });

              ws2.on('error', (error) => {
                done(error);
              });
            });
        });
    });
  });
});
