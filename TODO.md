# ToDo.md

### Todo

- [x] registrazione del client
  - [x] implementare le chiamate
  - [] implementare meccanismo per cui se in .env ci sono già client id e client secret usiamo quelli, altrimenti ci prendiamo quelli che prendiamo dal sito al momento della registrazione client
- [x] Scrivere pagina handlebars per dettagli del gioco  
  - [x] capire se c'è bisogno dell'if iniziale su apiFunction
- [x] studiarsi le funzioni mongodb per capire come memorizzare i preferiti
- [x] finire api db e javascript delle view .hbs
- [ ] modificare il render principale per mostrare se si è autenticati o no (magari anche con il nome) (es. cookie con nome)
- [ ] segnarsi come far partire l'applicazione da zero (server oauth, server web e db)
  - [ ] server oauth
  - [ ] server web
  - [ ] db
- [ ] creare il server web con comunicazione https (funziona quando faccio debug?)
- [ ] capire cosa bisogna fare con il flag secure:true del cookie
- [ ] eliminare view vecchie (favorites_ajax_old, game, games, secure)
- [ ] usare una session per passare igdb_client_id e igdb_client_secret
- [ ] verificare se c'è un flow più strutturato per il client credentials (in tal caso usare la libreria già usata)

### DB

- [] Testare collegamento db
- [] Populare funzioni in utils/mongodb per salvare, rimuovere e vedere preferiti
- [] Populare api per preferiti in routes/api
- [] Aggiornare view per bottone preferito

### In Progress

- [ ] Work on Github Repo [JIRA-345]  

### Done ✓

- [x] Create my first TODO.md  