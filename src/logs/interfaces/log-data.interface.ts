import { LogAction } from '../enums/log-action.enum';
import { LogModule } from '../enums/log-module.enum';

export interface LogData {
  module: LogModule | string;
  action: LogAction;
  entityUuid?: string;
  entityName?: string;
  description?: string;
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}
