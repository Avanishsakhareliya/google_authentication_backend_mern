const mongoose = require("mongoose")

mongoose.connect('mongodb://127.0.0.1:27017/Authentication', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("database connect success");
    })
    .catch((e) => {
        console.log("database NOT connect",e);
    })


