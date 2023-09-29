import { ConsoleLogger } from "@nestjs/common";

export class MyLogger extends ConsoleLogger {
  error(message: any, stack?: string, context?: string) {
    // add your tailored logic here
    super.error(message);
  }

  logInfo(transaction: string, user: string, role: string, message: any = null) {
    let str = `[${transaction}] [user: ${user}] [role: ${role}] [${JSON.stringify(message)}]`;
    super.log(str);
  }

  logError(transaction: string, user: string, role: string, message: any = null) {
    let str = `[${transaction}] [user: ${user}] [role: ${role}] [${JSON.stringify(message)}]`;
    super.error(str);
  }

  logStart(transaction: string, message: string, user: string, role: string) {
    let str = `[${transaction}] [user: ${user}] [role: ${role}] [${message}]  --- START ---`;
    super.log(str);
  }

  logEnd(transaction: string, message: string, user: string, role: string) {
    let str = `[${transaction}] [user: ${user}] [role: ${role}] [${message}]  --- END ---`;
    super.log(str);
  }
}