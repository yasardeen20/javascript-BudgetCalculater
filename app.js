//#################--Budget-Controller--#################

var budgetController = (function(){

var Income = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
};

var Expense = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
};

//method to calculate percentage for each expenses
Expense.prototype.calPercentage = function(totalIncome){
    if(totalIncome > 0) {
        this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
        this.percentage = -1;
    }
};

//Return the percentage after calcuation done 
Expense.prototype.getPercentage = function() {
    return this.percentage;
};

var calculateTotal = function(type){
    var sum = 0;
    data.allItems[type].forEach(function(cur){
        sum += cur.value;
    });
    data.totals[type] = sum;
}

var data = {
    allItems: {
        exp: [],
        inc: []
    },
    totals: {
        exp: 0,
        inc: 0
    },

    budget: 0,
    percentage: -1 
};

return {
    addItem: function (type, des, val){
        var newItem, ID; 

        if (data.allItems[type].length > 0) {
            ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
        } else {
            ID = 0;
        }
        
        // Create new item based on 'inc' or 'exp' type
        if (type === 'exp') {
            newItem = new Expense(ID, des, val);
        } else if (type === 'inc') {
            newItem = new Income(ID, des, val);
        }
        
        // Push it into our data structure
        data.allItems[type].push(newItem);
        
        // Return the new element
        return newItem;
    },

    // create delete item in array 
    deleteItem: function(type, id) {
        var ids, index;

        ids = data.allItems[type].map(function(current){
            return current.id;
        });

        index = ids.indexOf(id);

        if(index !== -1) {
            data.allItems[type].splice(index, 1);
        }
    },

    calculateBudget: function(){

        //calculate total income and expenses
         calculateTotal('exp');
         calculateTotal('inc');  

         //calculate the budget: income - expenses
         data.budget = data.totals.inc - data.totals.exp;

         //calculate the percentage of income that we spent
         if(data.totals.inc>0){
         data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
         } else {
             data.percentage = -1;
         }

    },

    calculatePercentages: function(){
        data.allItems.exp.forEach(function(cur) {
            cur.calPercentage(data.totals.inc);
        });
    },

    getPercentages: function(){
        var allPercentage = data.allItems.exp.map(function(cur) {
            return cur.getPercentage();
        });
        return allPercentage;
    },

    getBudget: function() {
        return {
            budget: data.budget,
            totalInc: data.totals.inc,
            totalExp: data.totals.exp,
            percentage: data.percentage
        };
    }
};



}());


//#################--UI-Controller--#################

var UIConroller = (function(){

    DOMstring = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputAmount: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer:'.income__list',
        expensesContainer:'.expenses__list',
        budgetLable:'.budget__value',
        incomeLable:'.budget__income--value',
        expensesLable:'.budget__expenses--value',
        percentageLable:'.budget__expenses--percentage',
        container:'.container',
        expensesPercentages: '.item__percentage',
        monthLable: '.budget__title--month'
    };

   var formatNumber = function(num, type){
        var numSplit, int, dec, type;

        num =Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length -3) + ',' + int.substr(int.length -3, 3);
        }

        dec = numSplit[1];
        return(type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function (list, callback) {
        for(var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function(){
            return {
                type: document.querySelector(DOMstring.inputType).value,
                description: document.querySelector(DOMstring.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstring.inputAmount).value)
            };
        },
        
        addListItem: function(obj, type) {
            var html, newHTML, elements; 
            //create HTML string with placeholder text
           if(type == 'inc') {
                elements = DOMstring.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                elements = DOMstring.expensesContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            //replace the placeholder text with some actual data
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));

            //insert the html into the DOM
            document.querySelector(elements).insertAdjacentHTML('beforeend', newHTML);
      
        },

        //Remove item on display
        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        //Clear fields
        clearFileds: function() {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstring.inputDescription + ', ' + DOMstring.inputAmount);

            fieldsArr =Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
                
            });

            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstring.budgetLable).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMstring.incomeLable).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstring.expensesLable).textContent = formatNumber(obj.totalExp, 'exp');
            
            if(obj.percentage > 0) {
                document.querySelector(DOMstring.percentageLable).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstring.percentageLable).textContent = '--';
        
            }
        },

        //Display percentages on the UI
        displayPercentages: function(percentage) {

            var fileds = document.querySelectorAll(DOMstring.expensesPercentages);

            

            nodeListForEach(fileds, function(current, index){
                if(percentage[index] > 0){
                    current.textContent = percentage[index] + '%';
                } else {
                    current.textContent = '--';
                }
            });

        },
        //display month on UI
        displayMonth: function(){
            var now, year, month, months;
  
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', ' October', 'November','December'];

            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DOMstring.monthLable).textContent = months[month ] + ' ' + year;
        },

        changeType: function(){

        },

        getDomString: function(){
            return DOMstring;
        }
        
    }

}());




//#################--APP-Controller--#################

var controller = (function(budgetCtrl,UICtrl){

    var setUpeventListner = function(){
       
        var DOM = UICtrl.getDomString();
        UICtrl.displayMonth();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem); //when click input btn
        document.addEventListener('keypress', function(event){  
            if(event.keyCode == 13 || event.which === 13){
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    };

    var updateBudget = function() {

        //1. calculate the budget
        budgetCtrl.calculateBudget();

        //2. Return the budget
        var budget = budgetCtrl.getBudget();
        
        //3. Display the budget on the UI
        UICtrl.displayBudget(budget);

    }

    var updatePercentages = function() {

        //1. calculate percentages
        budgetCtrl.calculatePercentages();

        //2. read percentages from the budget controller
        var percentage = budgetCtrl.getPercentages();

        //3. update percentages
        UICtrl.displayPercentages(percentage);
    };
    
    var ctrlAddItem = function(){
        var input, newItem;
        //1.get the filed input data
         input = UICtrl.getInput();
        
         if(input.description !== "" && !isNaN(input.value) && input.value > 0 ) {
         //2. add the new item to budget cotroller
         newItem = budgetCtrl.addItem(input.type, input.description, input.value);

         //3Add the item to the UI
          UICtrl.addListItem(newItem, input.type);
 
          //4.Clear Fields
          UICtrl.clearFileds();

          //5. Calculate and update the budget
          updateBudget();

          //6. update percentages
          updatePercentages();

         }
        
    };

    var ctrlDeleteItem = function() {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. delete the item in the data structure by passing type and id 
            budgetCtrl.deleteItem(type, ID);

            //2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            //3. Update and display the new budget
            updateBudget();

            //4.update percentages
            updatePercentages();


        }
    };

    return {
        init: function(){
         UICtrl.displayBudget({
            budget: 0,
            totalInc: 0,
            totalExp: 0,
            percentage: -1  
         });
         setUpeventListner();
        }
    }
 

}(budgetController,UIConroller));



controller.init();
