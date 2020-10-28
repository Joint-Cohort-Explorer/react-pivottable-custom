# react-pivottable-custom
This is a library with some customized functions based on `react-pivottable`, mainly for testing and demo. 

Please see [https://github.com/plotly/react-pivottable#readme](https://github.com/plotly/react-pivottable#readme) for more details of usage of the original table.

## Added features

### 1.Unused Attributes with categories
Updated Version
```JavaScript
                attrClassified: true,
                attrCategory:[
                    {
                        name: "Payer",
                        // attributes: ['Payer Gender'],
                        subcategory: [
                            {
                                name: "Test1",
                                attributes: ['Payer Smoker'],
                                subcategory: [
                                    {
                                        name: "Test2",
                                        attributes:  ['Payer Gender']
                                }
                                ]
                            },
                        ]
                    },
                    {
                        name: "Money",
                        attributes:  ['Tip', 'Total Bill'],
                    },
                    {
                        name: "Others",
                        // attributes: ['Day of Week','Meal','Party Size'],
                        subcategory:[
                            {
                                name: "Test1",
                                attributes: ['Meal'],
                                subcategory: [
                                    {
                                        name: "Test2",
                                        attributes:  ['Day of Week']
                                },{
                                    name: "Test3",
                                    attributes: ['Party Size']
                                }
                                ]
                            },
                        ]
                    }
                ],
```
### 2. Set category level to display
### 3. Customized the default orders of unused attributes (to update in next version)
### 4. Add attribute filters for better user experience when there are more attributes