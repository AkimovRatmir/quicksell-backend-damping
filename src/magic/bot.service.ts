import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BotService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  runBot(organizationId: string): void {
	  const pythonPath = path.resolve(process.cwd(), 'venv/bin/python3');  // 👉 Python interpreter
	  const scriptPath = path.resolve(process.cwd(), 'src/magic/py_bot_mongo.py');  // 👉 Your bot script

	  const jwtPayload = { organizationID: organizationId };
	  const jwtSecret = this.configService.get<string>('JWT_SECRET') || 'fallback_secret';

	  const token = this.jwtService.sign(jwtPayload, {
	    secret: jwtSecret,
	    expiresIn: '10m',
	  });

	  console.log(`Starting bot with JWT for org: ${organizationId}`);
	  console.log(`Bot script path: ${scriptPath}`);

	  const child = spawn(pythonPath, [scriptPath, token]);  // ✅ Correctly launches the bot

	  child.stdout.on('data', (data) => {
	    console.log(`[BOT OUTPUT]: ${data.toString()}`);
	  });

	  child.stderr.on('data', (data) => {
	    console.error(`[BOT ERROR]: ${data.toString()}`);
	  });

	  child.on('close', (code) => {
	    console.log(`Bot process exited with code ${code}`);
	  });
	}

}
