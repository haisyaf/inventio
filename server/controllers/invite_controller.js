const prisma = require("../lib/prisma");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../utils/email_sender");

exports.getInvites = async (req, res) => {
  const { tenantId } = req.userData;
  try {
    const invites = await prisma.invite.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        used: true,
        expiresAt: true,
        createdAt: true,
      },
    });
    res.json(invites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.createInvite = async (req, res) => {
  const { email } = req.body;
  const { tenantId, userId } = req.userData;

  try {
    const existingUser = await prisma.user.findFirst({
      where: { email, tenantId },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists in this tenant.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const invite = await prisma.invite.create({
      data: {
        email,
        token,
        expiresAt,
        tenantId,
      },
    });

    const feUrl = process.env.FE_URL || "http://localhost:5173";
    const inviteLink = `${feUrl}/invite/accept?token=${token}`;

    await sendEmail(
      email,
      "Undangan bergabung ke Inventio",
      `<p>Anda diundang untuk bergabung ke tim di Inventio.</p>
       <p>Klik link berikut untuk mendaftar (berlaku 24 jam):</p>
       <a href="${inviteLink}">${inviteLink}</a>`,
    );

    res.status(201).json({ message: "Invite created successfully.", invite });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.verifyInvite = async (req, res) => {
  const { token } = req.params;

  try {
    const invite = await prisma.invite.findUnique({
      where: { token },
    });

    if (!invite || invite.used || new Date() > invite.expiresAt) {
      return res
        .status(404)
        .json({ message: "Invite is invalid or has expired." });
    }

    res.status(200).json({ email: invite.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.acceptInvite = async (req, res) => {
  const { token, name, password } = req.body;

  try {
    const invite = await prisma.invite.findUnique({
      where: { token },
    });

    if (!invite || invite.used || new Date() > invite.expiresAt) {
      return res
        .status(404)
        .json({ message: "Invite is invalid or has expired." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [, user] = await prisma.$transaction([
      prisma.invite.update({
        where: { id: invite.id },
        data: { used: true },
      }),
      prisma.user.create({
        data: {
          name,
          email: invite.email,
          password: hashedPassword,
          tenantId: invite.tenantId,
          role: "MEMBER",
        },
      }),
    ]);

    res
      .status(201)
      .json({ message: "User registered successfully!", userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
