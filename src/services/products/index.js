import express from "express"
import ProductModel from "../../models/products/index.js"

const { Router } = express

const productsRouter = new Router()

productsRouter.get("/", async (req, res) => {
    const products = await ProductModel.find({})
    res.status(200).send({ products })
})

productsRouter.get("/:productId", async (req, res) => {
    try {
        let id = req.params.productId;
        const product = await ProductModel.findById(id)
        if (!product) throw new Error("Invalid data")
        res.status(200).send(product)
    } catch (error) {
        res.status(404).send({ message: error.message })
    }

})
productsRouter.post("/", async (req, res) => {

    try {
        const { description, price } = req.body

        if (!description || !price) throw new Error("Invalid data")

        const product = new ProductModel({ description, price })
        await product.save()

        res.status(201).send(product)

    } catch (error) {
        res.status(400).send({ message: error.message })
    }
})


productsRouter.delete("/:productId", async (req, res) => {
    try {
        let id = req.params.productId
        const product = await ProductModel.findById(id)
        if (!product) throw new Error("Invalid data")
        await ProductModel.findByIdAndDelete(id)
        res.status(204).send()
    } catch (error) {
        res.status(404).send({ message: error.message })
    }

})

productsRouter.put("/:productId", async (req, res) => {
    try {
        const id = req.params.productId
        if (typeof req.body.description !== "string") throw new Error("description can be only a string")
        const product = await ProductModel.findById(id)
        if (!product) throw new Error("Invalid data")
        if (product.description === req.body.description) throw new Error("add a different description plz")
        const newProduct = await ProductModel.findByIdAndUpdate(id, req.body, {
            runValidators: true,
            new: true
        })


        res.status(201).send(newProduct)
    } catch (error) {
        switch (error.message) {
            case "Invalid data":
                res.status(404).send({ message: error.message })
                break
            case "add a different description plz":
                res.status(400).send({ message: error.message })
                break
            case "description can be only a string":
                res.status(400).send({ message: error.message })
                break
        }

    }

})



export default productsRouter