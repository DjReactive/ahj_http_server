const http = require('http');
const Koa = require('koa');
const cors = require('@koa/cors');
const koaBody = require('koa-body');
const koaStatic = require('koa-static');
const app = new Koa();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const public = path.join(__dirname, '/public');

app.use(cors());
app.use(koaStatic(public));
app.use(koaBody({
    text: true,
    urlencoded: true,
    multipart: true,
    json: true,
  }),
);

let ticketsFull = new Map();
let counter = 1;
for (let i = 0; i < 3; i++) {
  ticketsFull.set(uuidv4(), {
    id: counter,
    name: `Тикет #${i+1} (описание)`,
    description: 'Какое-то описание выавыавыавыавы тикета',
    status: Math.random() > 0.5 ? false : true,
    created: Date.now(),
  });
  counter += 1;
}

function getTickets() {
  const arr = [];
  Array.from(ticketsFull).forEach( t => {
    arr.push({
      id: t[1].id,
      name: t[1].name,
      status: t[1].status,
      created: t[1].created,
    });
  })
  return arr;
}

function getTicketUUID(id) {
  let uuid = null;
  Array.from(ticketsFull).forEach( t => {
    if (Number(t[1].id) === Number(id)) uuid = t[0];
  });
  return uuid;
}

function getCounter() {
  counter += 1;
  return counter;
}

app.use(async ctx => {
  const query = (ctx.request.method === 'POST') ? ctx.request.body : ctx.request.query;

  let tickets = getTickets();
  let uuid;

  switch (ctx.request.query.method) {
    case 'allTickets':
      ctx.response.body = JSON.stringify({ error: false, result: tickets });
      ctx.response.status = 200;
      return;
    case 'ticketById':
      uuid = getTicketUUID(query.id);
      ctx.response.body = (uuid) ?
      JSON.stringify({ error: false, result: ticketsFull.get(uuid) }) :
      JSON.stringify({ error: true, result: 'Id not found' });
      return;
    case 'createTicket':
      ticketsFull.set(uuidv4(), {
        id: getCounter(),
        name: query.name,
        description: query.description,
        status: false,
        created: Date.now(),
      });
      tickets = getTickets();
      ctx.response.body = JSON.stringify({ error: false, result: tickets });
      ctx.response.status = 200;
      return;
    case 'editTicket':
    console.log(query);
      uuid = getTicketUUID(query.id);
      if (uuid) {
        ticketsFull.get(uuid).name = query.name;
        ticketsFull.get(uuid).description = query.description;
        tickets = getTickets();
        ctx.response.body = JSON.stringify({ error: false, result: tickets });
        ctx.response.status = 200;
      } else {
        ctx.response.body = JSON.stringify(
          { error: true, result: 'Error edit ticket ID' });
        ctx.response.status = 400;
      }
      return;
    case 'removeTicket':
      uuid = getTicketUUID(query.id);
      if (ticketsFull.delete(uuid)) {
        tickets = getTickets();
        ctx.response.body = JSON.stringify({ error: false, result: tickets });
        ctx.response.status = 200;
      } else {
        ctx.response.body = JSON.stringify(
          { error: true, result: 'ID not founded or incorrect' });
        ctx.response.status = 400;
      }
      return;
    default:
      ctx.response.body = 'response';
      ctx.response.status = 404;
      return;
  }
});
const port = process.env.PORT || 7070;
const server = http.createServer(app.callback()).listen(port);
