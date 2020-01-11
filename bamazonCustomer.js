var mysql = require("mysql");
var inquirer = require("inquirer");
//  Connect to MySQL Database bamazon
var connection = mysql.createConnection({
    host:"localhost",
    port:3306,
    user:"root",
    password:"Avionics@1985",
    database:"bamazon"
});
connection.connect(function(err){
    if(err) throw err;
    console.log("Connection Successful!");
    makeTable();
});
//  Create makeTable function in order to display the items in stock
var makeTable = function(){
    connection.query("SELECT * FROM products", function(err,res){
        for(var i=0; i<res.length; i++){
            console.log(
            res[i].itemid+" || " +
            res[i].product_name+" || " +
            res[i].department_name+" || " +
            res[i].price+" || " +
            res[i].stock_quantity+"\n");
        };
    //  Use the response in order to select items to purchase    
    promptCustomer(res);
    });
};
//  Create function to prompt customer to make selections
var promptCustomer = function(res){
    inquirer.prompt([{
        type:"input",
        name:"choice",
        message:"What would you like to puchase? [Quit with Q]"
    }]).then(function(answer){
        if(answer.choice.toUpperCase()=="Q"){
            process.exit();
        }
        var correct=false;
        for(var i=0; i<res.length; i++){
            if(res[i].product_name==answer.choice){
                correct=true;
                var product=answer.choice;
                var id=i;
                inquirer.prompt({
                    type:"input",
                    name:"quant",
                    message:"How many items would you like to buy?",
                    validate:  function(value){
                        if(isNaN(value)==false){
                            return true;
                        }   else{
                            return false;
                        }
                    }
                }).then(function(answer){
                    if((res[id].stock_quantity-answer.quant)>0){
                        connection.query("UPDATE products SET stock_quantity ='"+(res[id].stock_quantity-answer.quant)+"' WHERE product_name='"+product+"'", function(err,res2){
                            console.log("Product Bought!");
                            makeTable();
                        })
                    }   else{
                        console.log("Not a valid selection!");
                        promptCustomer(res);
                    }
                })
            }
            
        }
        if(i==res.length && correct==false){
            console.log("Not a valid selection!");
            promptCustomer();
        }
    })
}
