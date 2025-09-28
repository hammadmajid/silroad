import { getInbound } from './inbound';

interface EmailMetadata {
	userAgent?: string;
	ipAddress?: string;
	country?: string;
	rayId?: string;
	timestamp: string;
	environment: string;
	userId?: string;
	userName?: string;
	userEmail?: string;
	[key: string]: unknown;
}

interface EmailOptions {
	to: string;
	subject: string;
	html: string;
	metadata?: Partial<EmailMetadata>;
}

interface EmailContext {
	platform?: App.Platform;
	request?: Request;
	user?: {
		id: string;
		name: string;
		email: string;
		image?: string | null;
	};
}

export function extractMetadata(context: EmailContext): EmailMetadata {
	const metadata: EmailMetadata = {
		timestamp: new Date().toISOString(),
		environment: context.platform?.env?.NODE_ENV || 'development'
	};

	if (context.request) {
		const headers = context.request.headers;
		metadata.userAgent = headers.get('User-Agent') || undefined;
		metadata.ipAddress = headers.get('CF-Connecting-IP') || undefined;
		metadata.country = headers.get('CF-IPCountry') || undefined;
		metadata.rayId = headers.get('CF-Ray') || undefined;
	}

	if (context.user) {
		metadata.userId = context.user.id;
		metadata.userName = context.user.name;
		metadata.userEmail = context.user.email;
	}

	return metadata;
}

function generateMetadataHtml(metadata: EmailMetadata): string {
	const metadataEntries = Object.entries(metadata)
		.filter(([_, value]) => value !== undefined && value !== null)
		.map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
		.join('');

	return `
		<div style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px; font-size: 12px; color: #6c757d;">
			<h4 style="margin: 0 0 10px 0; font-size: 14px; color: #495057;">Request Details</h4>
			<ul style="margin: 0; padding-left: 20px;">
				${metadataEntries}
			</ul>
		</div>
	`;
}

export function sendEmail(context: EmailContext, options: EmailOptions): void {
	const { platform } = context;
	if (!platform) return;

	if (platform.env.NODE_ENV === "test") {
		// don't send email in test mode
		console.warn("Test mode: will not send email");
		return
	}

	const fullMetadata = {
		...extractMetadata(context),
		...options.metadata
	};

	const enrichedHtml = `
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
			${options.html}
			${generateMetadataHtml(fullMetadata)}
		</div>
	`;

	const inbound = getInbound(platform);
	platform?.ctx.waitUntil(
		inbound.emails.send({
			from: 'Silroad <no-reply@silroad.space>',
			to: options.to,
			subject: options.subject,
			html: enrichedHtml
		})
	);
}

export function createWelcomeEmail(user: {
	name: string;
	email: string;
}): Omit<EmailOptions, 'to'> {
	return {
		subject: 'Welcome to Silroad!',
		html: `
			<h2>Welcome to Silroad, ${user.name}!</h2>
			<p>Thank you for joining our community of event organizers and attendees.</p>
			<p>With Silroad, you can:</p>
			<ul>
				<li>Discover exciting events happening in your area</li>
				<li>Create and manage your own organization</li>
				<li>Host events and manage RSVPs</li>
				<li>Connect with like-minded people in your community</li>
			</ul>
			<p>To get started, visit your <a href="https://silroad.space/settings/profile" style="color: #007bff;">profile settings</a> to complete your account setup.</p>
			<p>Happy event organizing!</p>
			<p><strong>The Silroad Team</strong></p>
		`,
		metadata: {
			emailType: 'welcome',
			userEmail: user.email
		}
	};
}

export function createRsvpConfirmationEmail(
	user: { name: string; email: string },
	event: { title: string; slug: string; dateOfEvent: Date; description?: string | null },
	isJoining: boolean
): Omit<EmailOptions, 'to'> {
	const action = isJoining ? 'confirmed your RSVP to' : 'cancelled your RSVP for';
	const subject = isJoining ? `RSVP Confirmed: ${event.title}` : `RSVP Cancelled: ${event.title}`;

	const html = isJoining
		? `
			<h2>RSVP Confirmed!</h2>
			<p>Hi ${user.name},</p>
			<p>You have successfully ${action} the following event:</p>
			<div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 8px;">
				<h3 style="margin-top: 0;">${event.title}</h3>
				${event.description ? `<p>${event.description}</p>` : ''}
				<p><strong>Date:</strong> ${event.dateOfEvent.toLocaleDateString('en-US', {
					weekday: 'long',
					year: 'numeric',
					month: 'long',
					day: 'numeric',
					hour: '2-digit',
					minute: '2-digit'
				})}</p>
				<p><a href="https://silroad.space/explore/events/${event.slug}" style="color: #007bff;">View Event Details</a></p>
			</div>
			<p>We look forward to seeing you there!</p>
			<p><strong>The Silroad Team</strong></p>
		`
		: `
			<h2>RSVP Cancelled</h2>
			<p>Hi ${user.name},</p>
			<p>You have ${action}:</p>
			<div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 8px;">
				<h3 style="margin-top: 0;">${event.title}</h3>
				<p><strong>Date:</strong> ${event.dateOfEvent.toLocaleDateString('en-US', {
					weekday: 'long',
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})}</p>
			</div>
			<p>You can always RSVP again by visiting the event page.</p>
			<p><strong>The Silroad Team</strong></p>
		`;

	return {
		subject,
		html,
		metadata: {
			emailType: 'rsvp_confirmation',
			eventSlug: event.slug,
			eventTitle: event.title,
			action: isJoining ? 'join' : 'leave'
		}
	};
}

export function createOrganizationCreatedEmail(
	user: { name: string; email: string },
	organization: { name: string; slug: string; description?: string | null }
): Omit<EmailOptions, 'to'> {
	return {
		subject: `Organization Created: ${organization.name}`,
		html: `
			<h2>Organization Created Successfully!</h2>
			<p>Hi ${user.name},</p>
			<p>Congratulations! You have successfully created your organization:</p>
			<div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 8px;">
				<h3 style="margin-top: 0;">${organization.name}</h3>
				${organization.description ? `<p>${organization.description}</p>` : ''}
				<p><a href="https://silroad.space/explore/orgs/${organization.slug}" style="color: #007bff;">View Organization</a></p>
			</div>
			<p>Next steps:</p>
			<ul>
				<li><a href="https://silroad.space/manage/event/create" style="color: #007bff;">Create your first event</a></li>
				<li>Customize your organization profile</li>
				<li>Invite team members to help manage events</li>
			</ul>
			<p><strong>The Silroad Team</strong></p>
		`,
		metadata: {
			emailType: 'organization_created',
			organizationSlug: organization.slug,
			organizationName: organization.name
		}
	};
}

export function createEventCreatedEmail(
	user: { name: string; email: string },
	event: { title: string; slug: string; dateOfEvent: Date; description?: string | null },
	organization: { name: string; slug: string }
): Omit<EmailOptions, 'to'> {
	return {
		subject: `Event Created: ${event.title}`,
		html: `
			<h2>Event Created Successfully!</h2>
			<p>Hi ${user.name},</p>
			<p>Your event has been created and is now live on Silroad:</p>
			<div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 8px;">
				<h3 style="margin-top: 0;">${event.title}</h3>
				<p><strong>Organization:</strong> ${organization.name}</p>
				${event.description ? `<p>${event.description}</p>` : ''}
				<p><strong>Date:</strong> ${event.dateOfEvent.toLocaleDateString('en-US', {
					weekday: 'long',
					year: 'numeric',
					month: 'long',
					day: 'numeric',
					hour: '2-digit',
					minute: '2-digit'
				})}</p>
				<p><a href="https://silroad.space/explore/events/${event.slug}" style="color: #007bff;">View Event</a></p>
			</div>
			<p>Tips for promoting your event:</p>
			<ul>
				<li>Share the event link with your network</li>
				<li>Post on social media</li>
				<li>Use relevant hashtags and keywords</li>
				<li>Engage with potential attendees</li>
			</ul>
			<p><strong>The Silroad Team</strong></p>
		`,
		metadata: {
			emailType: 'event_created',
			eventSlug: event.slug,
			eventTitle: event.title,
			organizationSlug: organization.slug
		}
	};
}

export function createPasswordResetEmail(
	email: string,
	resetToken: string
): Omit<EmailOptions, 'to'> {
	return {
		subject: 'Password Reset - Silroad',
		html: `
			<h2>Password Reset Request</h2>
			<p>Hi,</p>
			<p>You requested a password reset for your Silroad account.</p>
			<p>Click the link below to reset your password:</p>
			<div style="margin: 30px 0; text-align: center;">
				<a href="https://silroad.space/forget-password/new?token=${resetToken}"
				   style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
					Reset Password
				</a>
			</div>
			<p><strong>This link will expire in 15 minutes for security.</strong></p>
			<p>If you did not request a password reset, you can safely ignore this email. Your password will not be changed.</p>
			<p><strong>The Silroad Team</strong></p>
		`,
		metadata: {
			emailType: 'password_reset',
			userEmail: email
		}
	};
}
