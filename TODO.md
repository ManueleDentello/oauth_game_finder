# ToDo.md

### Todo
- [ ] togliere dal web le credenziali twitch
- [ ] riorganizzare sistemazione file
- [ ] eliminare le sessioni e i token al logout (verificare se sul server sono state implementate)
- [ ] compilare tutto il readme

### In Progress
- [ ] eliminare view vecchie (favorites_ajax_old, game, games, secure, i doppioni)
- [ ] reindirizzare tutte le chiamate http in https (vedi commenti)
- [ ] segnarsi come far partire l'applicazione da zero (server oauth, server web e db), soprattutto parte dei session e https
- [ ] decidere se richiamare refresh-token con redirect, oppure gestiro anche nel .all

### Done ✓
- [x] endpoint registrazione client e user
- [x] Scrivere pagina handlebars per dettagli del gioco
- [x] implementare funzioni, viste e routes per il db
- [x] modificare il render principale per mostrare se si è autenticati o no
- [x] forkare il server di bonissi
- [x] implementare ritorno user_name o user_id del server
- [x] Testare db e funzioni preferiti
- [x] implementare refresh token
- [x] sistemare menu
- [x] implementare l'uso di session per l'autenticazione twitch


da segnarsi nelle slide
- utilizzo di session e attributi
- utilizzo dell'access token