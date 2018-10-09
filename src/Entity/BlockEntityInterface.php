<?php

namespace Octave\CMSBundle\Entity;

interface BlockEntityInterface
{
    public function getType();

    public function getContent();

    public function getOrder();
}