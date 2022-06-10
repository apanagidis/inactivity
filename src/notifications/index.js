import * as Flex from '@twilio/flex-ui';

export default (flex, manager) => {
	registerCustomNotifications(flex, manager);
}

export const CustomNotifications = {
	InactiveNotification: "InactiveNotification"
}

function registerCustomNotifications(flex, manager) {
	flex.Notifications.registerNotification({
		id: CustomNotifications.InactiveNotification,
		type: Flex.NotificationType.error,
		content: "Channel moved to wrap up due to inactivity.",
		timeout: 5000

	});

}