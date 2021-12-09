
import { app } from '../app.js';
import supertest from "supertest"
import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

const request = supertest(app)

describe("Testing the testing environment", () => {

    it("should check that true is true", () => {
        expect(true).toBe(true);
    });


})

describe("Testing the app endpoints", () => {


    beforeAll(done => {
        console.log("This gets run before all tests in this suite")

        console.log(process.env.MONGO_URL_TEST)

        mongoose.connect(process.env.MONGO_URL_TEST).then(() => {
            console.log("Connected to the test database")
            done()
        }).catch(e => {
            console.log(e)
        })
    })



    it("should check that the GET /test endpoint returns a success message", async () => {
        const response = await request.get("/test");

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Test successful");
    })

    const validProduct = {
        name: "Test Product",
        price: 200,
    }

    let _id = null

    it("should check that the POST /products endpoint creates a new product", async () => {
        const response = await request.post("/products").send(validProduct)

        expect(response.status).toBe(201);
        expect(response.body._id).toBeDefined();
        expect(response.body.name).toBeDefined();
        expect(response.body.price).toBeDefined();

        _id = response.body._id
    })

    it("should check that the GET /products endpoint returns a list of products", async () => {
        const response = await request.get("/products");

        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
    })

    // When retrieving the /products/:id endpoint:
    // expect requests to return the correct product with a valid id
    it("should check that the GET /products/:id returns a valid product with a valid id", async () => {
        const response = await request.get(`/products/${_id}`);

        expect(response.status).toBe(200);
        expect(response.body._id).toBe(_id);
        expect(response.body.name).toBe(validProduct.name);
        expect(response.body.price).toBe(validProduct.price);
    })
    // expect requests to be 404 with a non-existing id
    it("should check that the GET /products/:id endpoint creates a 404 with a non-existing id", async () => {
        const response = await request.get(`/products/999999999999999999999999`)

        expect(response.status).toBe(404)
    })

    // When deleting the /products/:id endpoint:

    // expect successful 204 response code
    it("should check that the DELETE /products/:id returns 204", async () => {
        const response = await request.delete(`/products/${_id}`);
        expect(response.status).toBe(204);

        const deleteProductResponse = await request.get(`/products/${_id}`);
        expect(deleteProductResponse.status).toBe(404);
    })
    // expect 404 with a non-existing id
    it("should check that the DELETE /products/:id returns a 404 without a valid id", async () => {
        const response = await request.delete(`/products/999999999999999999999999`);

        expect(response.status).toBe(404);
    })

    // When updating a /product/:id endpoint with new data:
    const validUpdate = {
        name: "Test Product Updated"
    }

    // expect requests to be accepted.
    it("should check that PUT requests on /products/:id get accepted", async () => {
        const response = await request.put(`/products/${_id}`).send(validUpdate)

        console.log("HERE IS THE RESPONSE STATUS",response.status)
        expect(response.status).toBe(200);
        expect(response.body.name).toBe(validUpdate.name);
        expect(typeof response.body.name).toBe("string");
    })

    // expect 404 with a non-existing id
    // Expect the response.body.name to be changed
    // Expect the typeof name in response.body to be “string”


    afterAll(done => {
        mongoose.connection.dropDatabase()
            .then(() => {
                return mongoose.connection.close()
            })
            .then(() => {
                done()
            }).catch(e=> {
                console.log(e)
            })
    })


})