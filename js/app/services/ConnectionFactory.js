let ConnectionFactory = (function () {

    const stores = ['negociacoes']; 
    const version = 3;
    const dbName = 'aluraframe';

    let connection = null;
    let close = null;
    
    return class ConnectionFactory {
        
        constructor() {
            throw new Error('Não é possível criar instâncias de ConnectionFactory');
        }
    
        static getConnection() {
            return new Promise((resolve, reject) => {
                
                // requisição de abertura
                let openRequest = window.indexedDB.open(dbName, version);

                //  tenho que trabalhar com essa tríade de eventos para fazer a requisição de abertura ao banco                
                openRequest.onupgradeneeded = e => { // quando for disparado executa essa função
                    ConnectionFactory._createStores(e.target.result);
                }
                
                openRequest.onsuccess = e => { // sempre executado quando conseguir obter uma conexão
                    if(!connection) {
                        connection = e.target.result;
                        close = connection.close.bind(connection);
                        connection.close = function() {
                            throw new Error('Você não pode fechar diretamente a conexão');
                        }
                    }
                    resolve(connection);
                }
    
                openRequest.onerror = e => { // sempre executado quando der um erro
                    console.log(e.target.error);
                    reject(e.target.error.name);
                }
            });
        }
        
        static _createStores(connection) {
            
            stores.forEach( store => {
                if(connection.objectStoreNames.contains(store)) {
                    connection.deleteObjectStore(store);
                }
                connection.createObjectStore(store, { autoIncrement: true });
            });
        }

        static closeConnection() {
            if(connection) {
                close();
                connection = null;
            }
        }
    }
}) ();
// função auto invocada