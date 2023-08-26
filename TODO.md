# ToDo.md

### Todo
- [ ] segnarsi come far partire l'applicazione da zero (server oauth, server web e db)
- [ ] creare il server web con comunicazione https (flag secure:true della session)
- [ ] Testare db e funzioni preferiti
- [ ] implementare refresh token
- [ ] togliere dal web le credenziali twitch

### In Progress
- [ ] eliminare view vecchie (favorites_ajax_old, game, games, secure, i doppioni)
- [ ] decidere se implementare la libreria oauth_client anche per igdb, usare le session per passarsi i dati in tutti gli endpoint
- [ ] implementare ritorno user_name o user_id del server

### Done ✓
- [x] endpoint registrazione client e user
- [x] Scrivere pagina handlebars per dettagli del gioco
- [x] implementare funzioni, viste e routes per il db
- [x] modificare il render principale per mostrare se si è autenticati o no
- [x] forkare il server di bonissi