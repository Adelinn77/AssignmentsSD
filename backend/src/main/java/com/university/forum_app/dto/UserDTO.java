package com.university.forum_app.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.university.forum_app.entity.Role;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserDTO {

    private String username;
    private String email;
    private String phone;
    private String firstName;
    private String lastName;
    private Role role;
    private boolean accessRestricted;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
}
