/**
 * Offline regression tests for password-reset helpers and routing rules.
 * Does not send live email or mutate real accounts.
 */
import assert from "node:assert/strict";
import { safeNextPath } from "../src/lib/auth/paths";
import {
  PASSWORD_UPDATE_PATH,
  buildPasswordResetConfirmPath,
  buildPasswordResetRedirectTo,
  isPasswordRecoveryNext,
  mapPasswordResetRequestError,
  mapPasswordUpdateError,
  validateNewPassword,
} from "../src/lib/auth/passwordReset";

console.log("password-reset tests…");

{
  assert.equal(
    buildPasswordResetRedirectTo("https://www.halo-speak.com"),
    "https://www.halo-speak.com/auth/callback?next=%2Fauth%2Fupdate-password",
  );
  assert.equal(
    buildPasswordResetRedirectTo("http://localhost:3000/"),
    "http://localhost:3000/auth/callback?next=%2Fauth%2Fupdate-password",
  );
}

{
  const path = buildPasswordResetConfirmPath("abcTOKEN", PASSWORD_UPDATE_PATH);
  assert.equal(
    path,
    "/auth/confirm?token_hash=abcTOKEN&type=recovery&next=%2Fauth%2Fupdate-password",
  );
  // Reject open redirects in next
  const safe = buildPasswordResetConfirmPath("t", "https://evil.example");
  assert.match(safe, /next=%2Fauth%2Fupdate-password/);
}

{
  assert.equal(isPasswordRecoveryNext("/auth/update-password"), true);
  assert.equal(isPasswordRecoveryNext("/auth/update-password?x=1"), true);
  assert.equal(isPasswordRecoveryNext("/home"), false);
  assert.equal(isPasswordRecoveryNext("https://evil.com"), false);
  assert.equal(isPasswordRecoveryNext("//evil.com"), false);
  assert.equal(safeNextPath("//evil.com", "/home"), "/home");
}

{
  assert.equal(
    mapPasswordResetRequestError("email rate limit exceeded"),
    "Too many attempts. Wait a minute and try again.",
  );
  assert.equal(
    mapPasswordResetRequestError("Redirect URL not allowed"),
    "Couldn’t send a reset email from this site. Try again later.",
  );
  assert.equal(
    mapPasswordResetRequestError("weird provider error"),
    "Couldn’t send a reset email. Try again.",
  );
}

{
  assert.equal(
    mapPasswordUpdateError("Auth session missing"),
    "This reset link has expired. Request a new one.",
  );
  assert.equal(
    mapPasswordUpdateError("New password should be different"),
    "Choose a password you haven’t used recently.",
  );
  assert.equal(
    mapPasswordUpdateError("Password should contain at least 8 characters"),
    "Use at least 8 characters.",
  );
}

{
  assert.deepEqual(validateNewPassword("", ""), {
    password: "Enter a new password.",
    confirmPassword: "Confirm your password.",
  });
  assert.deepEqual(validateNewPassword("short", "short"), {
    password: "Use at least 8 characters.",
  });
  assert.deepEqual(validateNewPassword("longenough", "different1"), {
    confirmPassword: "Passwords don’t match.",
  });
  assert.deepEqual(validateNewPassword("longenough", "longenough"), {});
}

{
  // Forgot-password navigation targets stay reachable paths
  const forgot = "/forgot-password";
  const update = PASSWORD_UPDATE_PATH;
  const callbackNext = new URL(
    buildPasswordResetRedirectTo("https://halo-speak.com"),
  ).searchParams.get("next");
  assert.equal(forgot.startsWith("/"), true);
  assert.equal(update, "/auth/update-password");
  assert.equal(callbackNext, "/auth/update-password");
  assert.equal(isPasswordRecoveryNext(callbackNext), true);
}

console.log("password-reset tests passed.");
