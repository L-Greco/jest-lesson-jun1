import dotenv from "dotenv"
import supertest from "supertest"
import server from "../src/server"
import mongoose from "mongoose"
import ProductModel from "../src/models/products/index.js"
dotenv.config()

const request = supertest(server)

describe("Stage I - Testing the test env", () => {

    it("should test that true is true", () => {
        expect(true).toBe(true)
    })

    it("should test that false is not true", () => {
        expect(false).not.toBe(true)
    })

    it("should test that false is falsy", () => {
        expect(false).toBeFalsy()
    })

    it("should expect that the test key is 123", () => {
        console.log(process.env.TEST_KEY)
        expect(process.env.TEST_KEY).toBeDefined()
        expect(process.env.TEST_KEY).toBe("123")
    })


})

describe("Checking application main endpoints", () => {
    it("should check that the /test endpoint is working", async () => {
        const response = await request.get("/test")

        expect(response.status).toBe(200)
        expect(response.body.message).toBe("Test success!")
    })

    it("should check that the /products endpoint is working", async () => {
        const response = await request.get("/products")
        expect(response.status).toBe(200)
        expect(response.body.products).toBeDefined()
        expect(response.body.products.length).toBe(0)
    })

    const validData = {
        description: "Test product",
        price: 30
    }

    it("should check that the /products endpoint is allowing POST requests with valid data", async () => {
        const response = await request.post("/products").send(validData)
        expect(response.status).toBe(201)
        expect(response.body._id).toBeDefined()
        expect(response.body.description).toEqual(validData.description)
    })

    const invalidData = {
        description: "Test product"
    }

    it("should check that the /products endpoint is NOT allowing POST requests with invalid data", async () => {
        const response = await request.post("/products").send(invalidData)
        expect(response.status).toBe(400)
        expect(response.body._id).not.toBeDefined()
    })

    it("should test that the /products endpoint is returning valid data after creating", async () => {
        const response = await request.post("/products").send(validData)

        expect(response.body._id).toBeDefined()

        const product = await ProductModel.findById(response.body._id)

        expect(product.createdAt).toStrictEqual(new Date(response.body.createdAt))

    })

    it("should test that the /products endpoint is returning all the products available", async () => {
        const productResponse = await request.post("/products").send(validData)

        const response = await request.get("/products")

        const included = response.body.products.some(product => product._id === productResponse.body._id)

        expect(included).toBe(true)

    })

    it("should test that the /products/:id endpoint is returning 404 if the id is missing", async () => {
        const productResponse = await request.post("/products").send(validData)

        const response = await request.get(`/products/1234`)
        expect(response.status).toBe(404)

    })

    it("should test that when /products/:id is deleted , it returns status code 204", async () => {
        const productResponse = await request.post("/products").send(validData)
        console.log(productResponse.body._id)
        const response = await request.delete(`/products/${productResponse.body._id}`)
        expect(response.status).toBe(204)

    })
    it("should test that when we edit /products/:id, the description is changed ", async () => {

        const productResponse = await request.post("/products").send(validData)
        const response = await request.put(`/products/${productResponse.body._id}`).send(validData)
        expect(response.status).toBe(400)

    })
    it("should test that when we edit /products/:id, the description can only be a string", async () => {

        const unValidData = {
            description: 123,
            price: 30
        }

        const productResponse = await request.post("/products").send(validData)
        const response = await request.put(`/products/${productResponse.body._id}`).send(unValidData)
        expect(response.status).toBe(400)

    })
})

beforeAll((done) => {

    mongoose
        .connect(process.env.ATLAS_URL + "/test", { useNewUrlParser: true })
        .then(() => {
            console.log("Successfully connected to Atlas in test.")
            done()
        })
})

afterAll(done => {
    mongoose.connection.dropDatabase(() => {
        mongoose.connection.close(() => done())
    })
})