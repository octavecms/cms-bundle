<?php

namespace Octave\CMSBundle\Model;

use Octave\CMSBundle\Entity\Page;

interface TextPageExtensionInterface
{
    public function execute(Page $page);
}