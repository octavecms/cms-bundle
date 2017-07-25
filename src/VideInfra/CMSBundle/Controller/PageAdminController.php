<?php

namespace VideInfra\CMSBundle\Controller;

use Doctrine\ORM\EntityManager;
use Sonata\AdminBundle\Controller\CRUDController;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class PageAdminController extends CRUDController
{
    /**
     * @param $type
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function createPageAction($type)
    {
        $pageType = $this->get('vig.cms.page.factory')->create($type);

        return $this->forward($pageType->getController());
    }

    /**
     * @param null $id
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function editAction($id = null)
    {
        $page = $this->get('vig.cms.page.repository')->find($id);
        if (!$page) {
            throw new NotFoundHttpException(sprintf('Unable to find Page entity with id %s', $id));
        }

        $pageType = $this->get('vig.cms.page.factory')->create($page->getType());
        return $this->forward($pageType->getController(), ['page' => $page]);
    }
}