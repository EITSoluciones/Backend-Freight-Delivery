import {
  ForbiddenException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AppConfigRepository } from 'src/app-config/repositories/app-config.repository';

type LicenseValidationResponse = {
  message: string;
  data: {
    activation_code: string;
  };
};

type LicenseValidationErrorResponse = {
  error?: string;
};

@Injectable()
export class LicenseValidationService {
  constructor(
    private readonly http: HttpService,
    private readonly appConfigRepository: AppConfigRepository,
  ) {}

  async validate(): Promise<LicenseValidationResponse> {
    const licenseServerUrl = process.env.URL_SERVER_LICENCES;

    if (!licenseServerUrl) {
      throw new ServiceUnavailableException(
        'La configuración de validación de licencia está incompleta.',
      );
    }

    const activationCode =
      await this.appConfigRepository.findActiveByKey('activation_code');

    if (!activationCode?.value) {
      throw new ServiceUnavailableException(
        'No se encontró un código de activación activo.',
      );
    }

    let endpoint: string;

    try {
      const configuredUrl = new URL(licenseServerUrl);
      endpoint = `${configuredUrl.origin}/api/clients/${encodeURIComponent(activationCode.value)}`;
    } catch {
      throw new ServiceUnavailableException(
        'URL_SERVER_LICENCES no contiene una URL válida.',
      );
    }

    try {
      const response = await this.http.axiosRef.get<
        LicenseValidationResponse | LicenseValidationErrorResponse
      >(endpoint, { validateStatus: () => true });
      const license = response.data;

      if (response.status >= 400 || !('data' in license)) {
        throw new ForbiddenException(
          ('error' in license && license.error) ||
            'La licencia no es válida para esta aplicación.',
        );
      }

      return license;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      throw new ServiceUnavailableException(
        'No fue posible validar la licencia. Intente nuevamente.',
      );
    }
  }
}
