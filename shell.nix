let
  pkgs = import <nixpkgs> {};
  # node = pkgs.stdenv.mkDerivation {
  #   name = "nodejs-wrapped";
  #   nativeBuildInputs = [ pkgs.makeWrapper ];
  #   src = [ pkgs.nodejs_latest ];
  #   installPhase = ''
  #     cp -r . $out
  #   '';
  # };
  node = pkgs.nodejs_latest;
  #   post = ''
  #     makeWrapperArgs+=(--experimental-strip-types)
  #   '';
  # });
in
pkgs.mkShell {
  packages = [ node ];
}
