"""
Services Package - DEPRECATED
Esta pasta está obsoleta. Use app.services ao invés disso.

Os serviços foram movidos para:
- app.services.ai_service
- app.services.validation_service
- app.services.chat_service
- app.services.notification_service
- app.services.analytics_service
- app.services.review_service
"""

# Importa serviços antigos para compatibilidade temporária
# TODO: Remover após migração completa
try:
    from . import chat_service
    from . import notification_service
    from . import analytics_service
    from . import review_service
except ImportError:
    pass
