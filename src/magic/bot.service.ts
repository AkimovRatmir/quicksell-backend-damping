import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BotService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  runBot(organizationId: string): void {
    const venvPython = path.resolve(process.cwd(), 'venv/bin/python3');
    const fallbackPython = 'python3'; // Use system-wide Python if venv doesn't exist

    const pythonPath = fs.existsSync(venvPython) ? venvPython : fallbackPython;
    const scriptPath = path.resolve(process.cwd(), 'src/magic/py_bot_mongo.py');

    const jwtPayload = { organizationID: organizationId };
    const jwtSecret = this.configService.get<string>('JWT_SECRET') || 'fallback_secret';

    const token = this.jwtService.sign(jwtPayload, {
      secret: jwtSecret,
      expiresIn: '10m',
    });

    console.log(`🚀 Starting bot for org: ${organizationId}`);
    console.log(`📍 Using Python from: ${pythonPath}`);
    console.log(`📄 Script path: ${scriptPath}`);

    const child = spawn(pythonPath, [scriptPath, token]);

    child.stdout.on('data', (data) => {
      console.log(`[BOT OUTPUT]: ${data.toString().trim()}`);
    });

    child.stderr.on('data', (data) => {
      console.error(`[BOT ERROR]: ${data.toString().trim()}`);
    });

    child.on('close', (code) => {
      console.log(`🔚 Bot process exited with code ${code}`);
    });
  }
}
