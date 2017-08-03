<?php

namespace VideInfra\CMSBundle\Controller;

use Sonata\AdminBundle\Controller\CRUDController;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class MediaController extends CRUDController
{
    public function listAction()
    {
        return $this->render('VideInfraCMSBundle:Media:list.html.twig', []);
    }
}