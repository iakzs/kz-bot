import type { RoboRequest, RoboReply } from '@robojs/server'
import { Flashcore } from 'robo.js'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { r2Client, BUCKET_NAME } from '../../../utils/r2'

export default async (request: RoboRequest, reply: RoboReply) => {
	if (request.method !== 'GET') {
		return reply.code(405).send('method not allowed fr')
	}

	const { id } = request.params

	try {
		const clips = await Flashcore.get<Record<string, { r2Key: string; filename: string; contentType: string }>>('clips')
		const clip = clips?.[id]

		if (!clip) {
			return reply.code(404).send('clip not found...')
		}

		const command = new GetObjectCommand({
			Bucket: BUCKET_NAME,
			Key: clip.r2Key
		})

		const url = await getSignedUrl(r2Client, command, { expiresIn: 3600 })

		return reply.send({
			url,
			filename: clip.filename,
			contentType: clip.contentType
		})
	} catch (error) {
		console.error('Error generating presigned URL:', error)
		return reply.code(500).send('error retrieving clip')
	}
}
