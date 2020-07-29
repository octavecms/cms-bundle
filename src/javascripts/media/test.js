const { default: store } = require("./store");

store.files.filter({id: 'aaa'}).on('change', () => {

});


store.files.get()