import router from './index';
import _ from 'lodash';
import { poolPromised, sql } from '../db';
import { API_KEY } from '../const';


exports.getOrder = router.get('/order', async (req, res, next) => {
    console.log(req.query);
    if(!_.has(req, 'query.key') || req.query.key !== API_KEY) {
        res.send(JSON.stringify({ success: false, message: 'Wrong API key' }));
    } else {
        const { orderFbid } = req.query;
        if(!_.isUndefined(orderFbid)) {
            try {
                const pool = await poolPromised;
                const queryResult = await pool.request()
                                            .input('OrderFBID', sql.NVarChar, orderFbid)
                                            .query('SELECT OrderId, OrderFBID, OrderPhone, OrderName, OrderAddress, OrderStatus, OrderDate, RestaurantId, TransactionId, COD, TotalPrice, NumOfItem FROM [Order] WHERE OrderFBID=@OrderFBID');
                if(queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
                } else {
                    res.send(JSON.stringify({ success: false, message: 'Empty' }));
                }                                       
            } catch(err) { 
                res.status(500); //Internal server error
                res.send(JSON.stringify({ success: false, message: err.message }));
            }
        } else {
            res.send(JSON.stringify({ success: false, message: 'Missing orderFbid'}));
        }
    }
})


exports.createOrder = router.post('/createOrder', async (req, res, next) => {
    console.log(req.body);
    if(req.body.key !== API_KEY) {
        res.send(JSON.stringify({ success: false, message: 'Wrong API key.'}));
    } else {
        const { orderPhone, ordername, orderAddress, orderStatus, orderDate,
            restaurantId, transactionId, COD, totalPrice, numOfItem, orderFbid } = req.body;
        console.log(req.body)
        if(!_.isUndefined(orderFbid)) {
            try {
                const pool = await poolPromised;
                const queryResult = await pool.request()
                                            .input('OrderFbid', sql.NVarChar, orderFbid)
                                            .input('OrderPhone', sql.NVarChar, orderPhone)
                                            .input('Ordername', sql.NVarChar, ordername)
                                            .input('OrderAddress', sql.NVarChar, orderAddress)
                                            .input('orderStatus', sql.Int, orderStatus)
                                            .input('OrderDate', sql.Date, orderDate)
                                            .input('RestaurantId', sql.Int, restaurantId)
                                            .input('TransactionId', sql.NVarChar, transactionId)
                                            .input('COD', sql.Bit, COD === true ? 1 : 0)
                                            .input('TotalPrice', sql.Float, totalPrice)
                                            .input('NumOfItem', sql.Int, numOfItem)
                                            .query('INSERT INTO [Order]'
                                                + ' (OrderFbid, OrderPhone, Ordername, OrderAddress, OrderStatus, OrderDate, RestaurantId, TransactionId, COD, TotalPrice, NumOfItem)'
                                                + ' VALUES'
                                                + ' (@OrderFbid, @OrderPhone, @Ordername, @OrderAddress, @OrderStatus, @OrderDate, @RestaurantId, @TransactionId, @COD, @TotalPrice, @NumOfItem)'
                                                + ' SELECT TOP 1 OrderId as OrderNumber FROM [Order] WHERE OrderFbid=@OrderFbid ORDER BY OrderNumber DESC'
                                            );
                if(!_.isUndefined(queryResult.recordset.length > 0)) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset, total: queryResult.recordset.length }));
                } else {
                    res.send(JSON.stringify({ success: false, message: 'Empty' }));
                }
            } catch(err) {
                res.status(500); //Internal server error
                res.send(JSON.stringify({ success: false, message: err.message }));
            }                                
        } else {
            res.send(JSON.stringify({ success: false, message: 'Missing orderFbid in POST request' }));
        }

    }
})