import express from 'express'
import { app as APP } from './configs/app'
import { ENV } from './utils/constants'
import routes from './routes'
import mongoConnection from './configs/db'
import redisConnection from './configs/redis/connection'

const APP_PORT = ENV.APP.PORT
const APP_NAME = ENV.APP.NAME

APP.use(express.json())
APP.use(express.urlencoded({ extended: true }))
APP.use('/services', routes)
APP.listen(APP_PORT, () => {
	mongoConnection()
	redisConnection()

	console.log(`services ${APP_NAME} running on ${APP_PORT}`)
})
